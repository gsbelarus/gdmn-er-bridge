import {AConnection, AStatement, ATransaction} from "gdmn-db";
import {
  Attribute,
  Attribute2FieldMap,
  Entity,
  ERModel,
  isEnumAttribute,
  isScalarAttribute,
  ScalarAttribute
} from "gdmn-orm";
import {DDLHelper, IScalarField} from "../ddl/DDLHelper";
import {DDLUniqueGenerator} from "../ddl/DDLUniqueGenerator";
import {GLOBAL_GENERATOR} from "../updates/Update1";
import {DomainResolver} from "./DomainResolver";
import {Prefix} from "../Prefix";

export class ERImport {

  private readonly _connection: AConnection;
  private readonly _erModel: ERModel;

  private _createATField: AStatement | undefined;
  private _createATRelation: AStatement | undefined;
  private _createATRelationField: AStatement | undefined;
  private _ddlHelper: DDLHelper | undefined;
  private _ddlUniqueGen = new DDLUniqueGenerator();

  constructor(connection: AConnection, erModel: ERModel) {
    this._connection = connection;
    this._erModel = erModel;
  }

  public async execute(): Promise<void> {
    await AConnection.executeTransaction({
      connection: this._connection,
      callback: async (transaction) => {
        this._ddlHelper = new DDLHelper(this._connection, transaction);
        try {
          await this._prepareStatements(transaction);
          await this._createERSchema();
          await this._disposeStatements();
        } finally {
          console.debug(this._ddlHelper.logs.join("\n"));
        }
      }
    });
  }

  public async _prepareStatements(transaction: ATransaction): Promise<void> {
    await this._ddlUniqueGen.prepare(this._connection, transaction);
    this._createATField = await this._connection.prepare(transaction, `
      INSERT INTO AT_FIELDS (FIELDNAME, LNAME, DESCRIPTION, NUMERATION)
      VALUES (:fieldName, :lName, :description, :numeration)
    `);
    this._createATRelation = await this._connection.prepare(transaction, `
      INSERT INTO AT_RELATIONS (RELATIONNAME, LNAME, DESCRIPTION)
      VALUES (:tableName, :lName, :description)
    `);
    this._createATRelationField = await this._connection.prepare(transaction, `
      INSERT INTO AT_RELATION_FIELDS (FIELDNAME, RELATIONNAME, ATTRNAME, LNAME, DESCRIPTION)
      VALUES (:fieldName, :relationName, :attrName, :lName, :description)
    `);
  }

  public async _disposeStatements(): Promise<void> {
    await this._ddlUniqueGen.dispose();
    if (this._createATField) {
      await this._createATField.dispose();
    }
    if (this._createATRelation) {
      await this._createATRelation.dispose();
    }
    if (this._createATRelationField) {
      await this._createATRelationField.dispose();
    }
  }

  private _getDDLHelper(): DDLHelper {
    if (this._ddlHelper) {
      return this._ddlHelper;
    }
    throw new Error("ddlHelper is undefined");
  }

  private async _scalarFieldName(attr: ScalarAttribute): Promise<string> {
    const attrAdapter = attr.adapter as Attribute2FieldMap;
    return attrAdapter ? attrAdapter.field : attr.name;
  }

  private async _tableName(entity: Entity): Promise<string> {
    // TODO adapter
    return entity.name;
  }

  private async _createERSchema(): Promise<void> {
    for (const sequence of Object.values(this._erModel.sequencies)) {
      const sequenceName = sequence.adapter ? (sequence.adapter as any).sequence : sequence.name;
      if (sequenceName !== GLOBAL_GENERATOR) {
        await this._getDDLHelper().addSequence(sequenceName);
      }
    }

    for (const entity of Object.values(this._erModel.entities)) {
      await this._addEntity(entity);
    }
  }

  private async _addEntity(entity: Entity): Promise<void> {
    const tableName = await this._tableName(entity);

    const fields: IScalarField[] = [];
    const pkFields: IScalarField[] = [];
    for (const attr of Object.values(entity.attributes).filter((attr) => isScalarAttribute(attr))) {
      const domainName = await this._addScalarDomain(attr);
      const fieldName = await this._scalarFieldName(attr);
      await this._bindATAttr(attr, tableName, fieldName, domainName);
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

    await this._bindATEntity(entity, tableName);
  }

  private async _addScalarDomain(attr: ScalarAttribute): Promise<string> {
    const domainName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.DOMAIN);
    await this._getDDLHelper().addScalarDomain(domainName, DomainResolver.resolveScalar(attr));
    return domainName;
  }

  private async _bindATEntity(entity: Entity, tableName: string): Promise<void> {
    if (this._createATRelation) {
      await this._createATRelation.execute({
        tableName,
        lName: entity.lName.ru ? entity.lName.ru.name : entity.name,
        description: entity.lName.ru ? entity.lName.ru.fullName : entity.name
      });
    } else {
      throw new Error("createATRelation is undefined");
    }
  }

  private async _bindATAttr(attr: Attribute, tableName: string, fieldName: string, domainName: string): Promise<void> {
    const numeration = isEnumAttribute(attr)
      ? attr.values.map(({value, lName}) => `${value}=${lName && lName.ru ? lName.ru.name : ""}`).join("#13#10")
      : undefined;

    if (this._createATField) {
      await this._createATField.execute({
        fieldName: domainName,
        lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
        description: attr.lName.ru ? attr.lName.ru.fullName : attr.name,
        numeration: numeration ? Buffer.from(numeration) : undefined
      });
    } else {
      throw new Error("createATField is undefined");
    }

    if (this._createATRelationField) {
      await this._createATRelationField.execute({
        fieldName: fieldName,
        relationName: tableName,
        attrName: fieldName !== attr.name ? attr.name : null,
        lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
        description: attr.lName.ru ? attr.lName.ru.fullName : attr.name
      });
    } else {
      throw new Error("createATRelationField is undefined");
    }
  }
}
