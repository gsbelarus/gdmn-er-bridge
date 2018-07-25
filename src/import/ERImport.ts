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
import {DDLHelper, IScalarField} from "../DDLHelper";
import {createATStructure} from "./createATStructure";
import {createDefaultDomains} from "./createDefaultDomains";
import {createDefaultGenerators, G_UNIQUE_NAME} from "./createDefaultGenerators";
import {createDocStructure} from "./createDocStructure";
import {DomainResolver} from "./DomainResolver";
import {Prefix} from "./Prefix";

export class ERImport {

  private readonly _connection: AConnection;
  private readonly _erModel: ERModel;

  private _createATField: AStatement | undefined;
  private _createATRelation: AStatement | undefined;
  private _createATRelationField: AStatement | undefined;
  private _ddlHelper: DDLHelper | undefined;

  constructor(connection: AConnection, erModel: ERModel) {
    this._connection = connection;
    this._erModel = erModel;
  }

  private static _tableName(entity: Entity): string {
    return entity.name;
  }

  private static _fieldName(attr: ScalarAttribute): string {
    const attrAdapter = attr.adapter as Attribute2FieldMap;
    return attrAdapter ? attrAdapter.field : attr.name;
  }

  public async execute(): Promise<void> {
    await this._createDefaultSchema();

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

  private async _createDefaultSchema(): Promise<void> {
    await AConnection.executeTransaction({
      connection: this._connection,
      callback: async (transaction) => {
        await createDefaultGenerators(this._connection, transaction);
        await createDefaultDomains(this._connection, transaction);
        await createATStructure(this._connection, transaction);
        await createDocStructure(this._connection, transaction);
      }
    });
  }

  private async _createERSchema(): Promise<void> {
    for (const sequence of Object.values(this._erModel.sequencies)) {
      const sequenceName = sequence.adapter ? (sequence.adapter as any).sequence : sequence.name;
      if (sequenceName !== Prefix.join(G_UNIQUE_NAME, Prefix.GDMN, Prefix.GENERATOR)) {
        if (this._ddlHelper) {
          await this._ddlHelper.addSequence(sequenceName);
        }
      }
    }

    for (const entity of Object.values(this._erModel.entities)) {
      await this._addEntity(entity);
    }
  }

  private async _addEntity(entity: Entity): Promise<void> {
    const tableName = ERImport._tableName(entity);

    const fields: IScalarField[] = [];
    for (const attr of Object.values(entity.attributes).filter((attr) => isScalarAttribute(attr))) {
      const domainName = await this._addScalarDomain(entity, attr);
      await this._bindATAttr(entity, attr, domainName);
      fields.push({
        name: ERImport._fieldName(attr),
        domain: domainName
      });
    }
    if (this._ddlHelper) {
      await this._ddlHelper.addTable(tableName, fields);
      await this._ddlHelper.addPrimaryKey(tableName, entity.pk.map((item) => item.name));
    }

    await this._bindATEntity(entity, tableName);
  }

  private async _addScalarDomain(entity: Entity, attr: ScalarAttribute): Promise<string> {
    // TODO possible name conflicts
    const domainName = Prefix.join(`${entity.name}_F${Object.keys(entity.attributes).indexOf(attr.name) + 1}`,
      Prefix.DOMAIN);
    if (this._ddlHelper) {
      await this._ddlHelper.addScalarDomain(domainName, DomainResolver.resolveScalar(attr));
    }
    return domainName;
  }

  private async _bindATEntity(entity: Entity, tableName: string): Promise<void> {
    if (this._createATRelation) {
      await this._createATRelation.execute({
        tableName,
        lName: entity.lName.ru ? entity.lName.ru.name : entity.name,
        description: entity.lName.ru ? entity.lName.ru.fullName : entity.name
      });
    }
  }

  private async _bindATAttr(entity: Entity, attr: Attribute, domainName: string): Promise<void> {
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
    }

    if (this._createATRelationField) {
      const fieldName = ERImport._fieldName(attr);
      await this._createATRelationField.execute({
        fieldName: fieldName,
        relationName: ERImport._tableName(entity),
        attrName: fieldName !== attr.name ? attr.name : null,
        lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
        description: attr.lName.ru ? attr.lName.ru.fullName : attr.name
      });
    }
  }
}
