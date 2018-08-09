import {AConnection} from "gdmn-db";
import {
  Attribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  EnumAttribute,
  ERModel,
  ParentAttribute,
  ScalarAttribute,
  SequenceAttribute,
  SetAttribute
} from "gdmn-orm";
import {ATHelper} from "../ATHelper";
import {Constants} from "../Constants";
import {DDLHelper, IFieldProps} from "../ddl/DDLHelper";
import {Prefix} from "../Prefix";
import {GLOBAL_GENERATOR} from "../updates/Update1";
import {DomainResolver} from "./DomainResolver";

interface IATEntityOptions {
  relationName: string;
}

interface IATAttrOptions {
  relationName: string;
  fieldName: string;
  domainName: string;
  masterEntity?: Entity;
  crossTable?: string;
  crossTableKey?: number;
  crossField?: string;
}

export class ERImport {

  private readonly _connection: AConnection;
  private readonly _erModel: ERModel;

  private _atHelper: ATHelper | undefined;
  private _ddlHelper: DDLHelper | undefined;

  constructor(connection: AConnection, erModel: ERModel) {
    this._connection = connection;
    this._erModel = erModel;
  }

  public static _getFieldName(attr: Attribute): string {
    const attrAdapter = attr.adapter;
    return attrAdapter ? attrAdapter.field : attr.name;
  }

  public async execute(): Promise<void> {
    await AConnection.executeTransaction({
      connection: this._connection,
      callback: async (transaction) => {
        this._ddlHelper = new DDLHelper(this._connection, transaction);
        this._atHelper = new ATHelper(this._connection, transaction);
        try {
          await this._getDDLHelper().prepare();
          await this._getATHelper().prepare();

          await this._createERSchema();

          await this._getDDLHelper().dispose();
          await this._getATHelper().dispose();
        } finally {
          console.debug(this._ddlHelper.logs.join("\n"));
        }
      }
    });
  }

  private _getDDLHelper(): DDLHelper {
    if (this._ddlHelper) {
      return this._ddlHelper;
    }
    throw new Error("ddlHelper is undefined");
  }

  private _getATHelper(): ATHelper {
    if (this._atHelper) {
      return this._atHelper;
    }
    throw new Error("atHelper is undefined");
  }

  private async _createERSchema(): Promise<void> {
    for (const sequence of Object.values(this._erModel.sequencies)) {
      const sequenceName = sequence.adapter ? sequence.adapter.sequence : sequence.name;
      if (sequenceName !== GLOBAL_GENERATOR) {
        await this._getDDLHelper().addSequence(sequenceName);
      }
    }

    for (const entity of Object.values(this._erModel.entities)) {
      await this._addEntity(entity);
    }

    for (const entity of Object.values(this._erModel.entities)) {
      await this._addLinks(entity);
    }

    for (const entity of Object.values(this._erModel.entities)) {
      await this._addUnique(entity);
    }
  }

  private async _addUnique(entity: Entity): Promise<void> {
    const tableName = entity.name;
    for (const attrs of entity.unique) {
      await this._getDDLHelper().addUnique(tableName, attrs.map((attr) => ERImport._getFieldName(attr)));
    }
  }

  private async _addLinks(entity: Entity): Promise<void> {
    const tableName = entity.name;
    for (const attr of Object.values(entity.attributes).filter((attr) => EntityAttribute.isType(attr))) {
      if (DetailAttribute.isType(attr)) {
        const fieldName = ERImport._getFieldName(entity.pk[0]);
        const adapter = attr.adapter;
        let detailTableName: string;
        let detailLinkFieldName: string;
        if (adapter && adapter.masterLinks.length) {
          detailTableName = adapter.masterLinks[0].detailRelation;
          detailLinkFieldName = adapter.masterLinks[0].link2masterField;
        } else {
          detailTableName = attr.name;
          detailLinkFieldName = Constants.DEFAULT_MASTER_KEY_NAME;
        }

        const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(attr));
        await this._getDDLHelper().addColumns(detailTableName, [{name: detailLinkFieldName, domain: domainName}]);
        await this._getDDLHelper().addForeignKey({
          tableName: detailTableName,
          fieldName: detailLinkFieldName
        }, {
          tableName,
          fieldName
        });
        await this._bindATAttr(attr, {
          relationName: detailTableName,
          fieldName: detailLinkFieldName,
          domainName: domainName,
          masterEntity: entity
        });

      } else if (SetAttribute.isType(attr)) {
        const crossTableName = Prefix.join(`${await this._getDDLHelper().ddlUniqueGen.next()}`, Prefix.CROSS);

        // create cross table
        const fields: IFieldProps[] = [];
        for (const crossAttr of Object.values(attr.attributes).filter((attr) => ScalarAttribute.isType(attr))) {
          const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(crossAttr));
          const fieldName = ERImport._getFieldName(crossAttr);
          await this._bindATAttr(crossAttr, {relationName: crossTableName, fieldName, domainName});
          const field = {
            name: fieldName,
            domain: domainName
          };
          fields.push(field);
        }

        const pkFields: IFieldProps[] = [];
        const refPKDomainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(attr.entity[0].pk[0]));
        const refPK = {
          name: Constants.DEFAULT_CROSS_PK_REF_NAME,
          domain: refPKDomainName
        };
        fields.unshift(refPK);
        pkFields.unshift(refPK);

        const ownPKDomainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(entity.pk[0]));
        const ownPK = {
          name: Constants.DEFAULT_CROSS_PK_OWN_NAME,
          domain: ownPKDomainName
        };
        fields.unshift(ownPK);
        pkFields.unshift(ownPK);

        await this._getDDLHelper().addTable(crossTableName, fields);
        await this._getDDLHelper().addPrimaryKey(crossTableName, pkFields.map((i) => i.name));

        const crossTableKey = await this._getATHelper().insertATRelations({
          relationName: crossTableName,
          relationType: "T",
          lName: crossTableName,
          description: crossTableName,
          semCategory: undefined
        });

        // create own table column
        const fieldName = attr.name;
        const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(attr));  // TODO varchar(presLen)
        await this._getDDLHelper().addColumns(tableName, [{name: fieldName, domain: domainName}]);
        await this._bindATAttr(attr, {
          relationName: tableName,
          fieldName,
          domainName,
          crossTable: crossTableName,
          crossTableKey
        });

        // add foreign keys for cross table
        await this._getDDLHelper().addForeignKey({
          tableName: crossTableName,
          fieldName: Constants.DEFAULT_CROSS_PK_OWN_NAME
        }, {
          tableName: entity.name,
          fieldName: ERImport._getFieldName(entity.pk[0])
        });
        await this._getDDLHelper().addForeignKey({
          tableName: crossTableName,
          fieldName: Constants.DEFAULT_CROSS_PK_REF_NAME
        }, {
          tableName: attr.entity[0].name,
          fieldName: ERImport._getFieldName(attr.entity[0].pk[0])
        });

      } else if (ParentAttribute.isType(attr) || EntityAttribute.isType(attr)) {
        const fieldName = ERImport._getFieldName(attr);
        const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(attr));
        await this._getDDLHelper().addColumns(tableName, [{name: fieldName, domain: domainName}]);
        await this._getDDLHelper().addForeignKey({
          tableName,
          fieldName
        }, {
          tableName: attr.entity[0].name,
          fieldName: ERImport._getFieldName(attr.entity[0].pk[0])
        });
        await this._bindATAttr(attr, {relationName: tableName, fieldName, domainName});
      }
    }
  }

  private async _addEntity(entity: Entity): Promise<void> {
    const tableName = entity.name;

    const fields: IFieldProps[] = [];
    const pkFields: IFieldProps[] = [];
    const seqAttrs: SequenceAttribute[] = [];
    for (const attr of Object.values(entity.attributes).filter((attr) => ScalarAttribute.isType(attr))) {
      const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(attr));
      const fieldName = ERImport._getFieldName(attr);
      await this._bindATAttr(attr, {relationName: tableName, fieldName, domainName});
      if (SequenceAttribute.isType(attr)) {
        seqAttrs.push(attr);
      }
      const field = {
        name: fieldName,
        domain: domainName
      };
      fields.push(field);
      if (entity.pk.includes(attr)) {
        pkFields.push(field);
      }
    }
    await this._getDDLHelper().addTable(tableName, fields);
    await this._getDDLHelper().addPrimaryKey(tableName, pkFields.map((i) => i.name));
    for (const seqAttr of seqAttrs) {
      const fieldName = ERImport._getFieldName(seqAttr);
      const seqAdapter = seqAttr.sequence.adapter;
      await this._getDDLHelper().addAutoIncrementTrigger(tableName, fieldName,
        seqAdapter ? seqAdapter.sequence : seqAttr.sequence.name);
    }

    await this._bindATEntity(entity, {relationName: tableName});
  }

  private async _bindATEntity(entity: Entity, options: IATEntityOptions): Promise<number> {
    return await this._getATHelper().insertATRelations({
      relationName: options.relationName,
      relationType: "T",
      lName: entity.lName.ru ? entity.lName.ru.name : entity.name,
      description: entity.lName.ru ? entity.lName.ru.fullName : entity.name,
      semCategory: undefined
    });
  }

  private async _bindATAttr(attr: Attribute, options: IATAttrOptions): Promise<void> {
    const numeration = EnumAttribute.isType(attr)
      ? attr.values.map(({value, lName}) => `${value}=${lName && lName.ru ? lName.ru.name : ""}`).join("#13#10")
      : undefined;

    const fieldSourceKey = await this._getATHelper().insertATFields({
      fieldName: options.domainName,
      lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
      description: attr.lName.ru ? attr.lName.ru.fullName : attr.name,
      refTable: undefined,
      refCondition: undefined,
      setTable: undefined,
      setListField: undefined,
      setCondition: undefined,
      numeration: numeration ? Buffer.from(numeration) : undefined
    });

    await this._getATHelper().insertATRelationFields({
      fieldName: options.fieldName,
      relationName: options.relationName,
      lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
      description: attr.lName.ru ? attr.lName.ru.fullName : attr.name,
      attrName: options.fieldName !== attr.name ? attr.name : undefined,
      isParent: ParentAttribute.isType(attr) || undefined,
      masterEntityName: options.masterEntity ? options.masterEntity.name : undefined,
      fieldSource: options.domainName,
      fieldSourceKey,
      semCategory: undefined,
      crossTable: options.crossTable,
      crossTableKey: options.crossTableKey,
      crossField: options.crossField
    });
  }
}
