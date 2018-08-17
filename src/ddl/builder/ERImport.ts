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
import {DDLHelper, IFieldProps, Sorting} from "../DDLHelper";
import {Prefix} from "../Prefix";
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

  private static _getTableName(entity: Entity): string {
    return entity.adapter ? entity.adapter.relation[entity.adapter.relation.length - 1].relationName : entity.name;
  }

  private static _getFieldName(attr: Attribute): string {
    if (SetAttribute.isType(attr)) {
      if (attr.adapter && attr.adapter.presentationField) return attr.adapter.presentationField;
    } else if (EntityAttribute.isType(attr) || ScalarAttribute.isType(attr)) {
      if (attr.adapter) return attr.adapter.field;
    }
    return attr.name;
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
      if (sequenceName !== Constants.GLOBAL_GENERATOR) {
        await this._getDDLHelper().addSequence(sequenceName);
      }
    }

    for (const entity of Object.values(this._erModel.entities)) {
      await this._addEntity(entity);
    }

    for (const entity of Object.values(this._erModel.entities)) {
      await this._addLinks(entity);
      await this._addUnique(entity);
    }
  }

  private async _addUnique(entity: Entity): Promise<void> {
    const tableName = ERImport._getTableName(entity);
    for (const attrs of entity.unique) {
      await this._getDDLHelper().addUnique(tableName, attrs.map((attr) => ERImport._getFieldName(attr)));
    }
  }

  private async _addLinks(entity: Entity): Promise<void> {
    const tableName = ERImport._getTableName(entity);
    for (const attr of Object.values(entity.ownAttributes).filter((attr) => EntityAttribute.isType(attr))) {
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
        await this._getDDLHelper().addForeignKey(DDLHelper.DEFAULT_FK_OPTIONS, {
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
        const crossTableName = attr.adapter
          ? attr.adapter.crossRelation
          : Prefix.join(`${await this._getDDLHelper().ddlUniqueGen.next()}`, Prefix.CROSS);

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
        const refPKDomainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(attr.entities[0].pk[0]));
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
          entityName: undefined,
          semCategory: undefined
        });

        // create own table column
        const fieldName = ERImport._getFieldName(attr);
        const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(attr));
        await this._getDDLHelper().addColumns(tableName, [{name: fieldName, domain: domainName}]);
        await this._bindATAttr(attr, {
          relationName: tableName,
          fieldName,
          domainName,
          crossTable: crossTableName,
          crossTableKey
        });

        // add foreign keys for cross table
        await this._getDDLHelper().addForeignKey(DDLHelper.DEFAULT_FK_OPTIONS, {
          tableName: crossTableName,
          fieldName: Constants.DEFAULT_CROSS_PK_OWN_NAME
        }, {
          tableName: ERImport._getTableName(entity),
          fieldName: ERImport._getFieldName(entity.pk[0])
        });
        await this._getDDLHelper().addForeignKey(DDLHelper.DEFAULT_FK_OPTIONS, {
          tableName: crossTableName,
          fieldName: Constants.DEFAULT_CROSS_PK_REF_NAME
        }, {
          tableName: ERImport._getTableName(attr.entities[0]),
          fieldName: ERImport._getFieldName(attr.entities[0].pk[0])
        });

      } else if (ParentAttribute.isType(attr)) {
        const fieldName = ERImport._getFieldName(attr);
        await this._getDDLHelper().addForeignKey({
          onUpdate: "CASCADE",
          onDelete: "CASCADE"
        }, {
          tableName,
          fieldName
        }, {
          tableName: ERImport._getTableName(attr.entities[0]),
          fieldName: ERImport._getFieldName(attr.entities[0].pk[0])
        });
      } else if (EntityAttribute.isType(attr)) {
        const fieldName = ERImport._getFieldName(attr);
        await this._getDDLHelper().addForeignKey(DDLHelper.DEFAULT_FK_OPTIONS, {
          tableName,
          fieldName
        }, {
          tableName: ERImport._getTableName(attr.entities[0]),
          fieldName: ERImport._getFieldName(attr.entities[0].pk[0])
        });
      }
    }
  }

  private async _addEntity(entity: Entity): Promise<void> {
    const tableName = ERImport._getTableName(entity);

    const fields: IFieldProps[] = [];
    const pkFields: IFieldProps[] = [];
    const seqAttrs: SequenceAttribute[] = [];
    const indexes: { field: string; type: Sorting }[] = [];
    const checks: string[] = [];
    for (const attr of Object.values(entity.ownAttributes)) {
      if (ScalarAttribute.isType(attr)) {
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
      } else if (DetailAttribute.isType(attr)) {
        // ignore
      } else if (SetAttribute.isType(attr)) {
        // ignore
      } else if (ParentAttribute.isType(attr)) {
        const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(attr));
        const fieldName = ERImport._getFieldName(attr);
        await this._bindATAttr(attr, {relationName: tableName, fieldName, domainName});
        const lbField = attr.adapter ? attr.adapter.lbField : Constants.DEFAULT_LB_NAME;
        const rbField = attr.adapter ? attr.adapter.rbField : Constants.DEFAULT_RB_NAME;
        fields.push({
          name: fieldName,
          domain: domainName
        });
        fields.push({
          name: lbField,
          domain: "DLB"
        });
        fields.push({
          name: rbField,
          domain: "DRB"
        });
        checks.push(`${lbField} <= ${rbField}`);
        indexes.push({field: lbField, type: "ASC"});
        indexes.push({field: rbField, type: "DESC"});
      } else if (EntityAttribute.isType(attr)) {
        const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(attr));
        const fieldName = ERImport._getFieldName(attr);
        await this._bindATAttr(attr, {relationName: tableName, fieldName, domainName});
        const field = {
          name: fieldName,
          domain: domainName
        };
        fields.push(field);
        if (entity.pk.includes(attr)) {
          pkFields.push(field);
        }
      }
    }
    await this._getDDLHelper().addTable(tableName, fields);
    await this._getDDLHelper().addTableCheck(tableName, checks);
    await this._getDDLHelper().addPrimaryKey(tableName, pkFields.map((i) => i.name));
    for (const index of indexes) {
      await this._getDDLHelper().createIndex(tableName, index.type, [index.field]);
    }
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
      entityName: options.relationName !== entity.name ? entity.name : undefined,
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
      lbFieldName: ParentAttribute.isType(attr) && attr.adapter && attr.adapter.lbField || undefined,
      rbFieldName: ParentAttribute.isType(attr) && attr.adapter && attr.adapter.rbField || undefined,
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
