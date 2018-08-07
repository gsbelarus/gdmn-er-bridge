import {AConnection, AStatement, ATransaction} from "gdmn-db";

export interface IInputATRelationFields {
  fieldName: string;
  relationName: string;
  lName: string;
  description: string | undefined;
  attrName: string | undefined;
  masterEntityName: string | undefined;
  isParent: boolean | undefined;
  fieldSource: string;
  fieldSourceKey: number;
  semCategory: string | undefined;
  crossTable: string | undefined;
  crossTableKey: number | undefined;
  crossField: string | undefined;
}

export interface IInputATRelations {
  relationName: string;
  relationType: "T" | "V" | undefined;
  lName: string;
  description: string | undefined;
  semCategory: string | undefined;
}

export interface IInputATFields {
  fieldName: string;
  lName: string;
  description: string | undefined;
  refTable: string | undefined;
  refCondition: string | undefined;
  setTable: string | undefined;
  setListField: string | undefined;
  setCondition: string | undefined;
  numeration: Buffer | undefined;
}

export class ATHelper {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;

  private _createATField: AStatement | undefined;
  private _createATRelation: AStatement | undefined;
  private _createATRelationField: AStatement | undefined;

  constructor(connection: AConnection, transaction: ATransaction) {
    this._connection = connection;
    this._transaction = transaction;
  }

  public async prepare(): Promise<void> {
    this._createATField = await this._connection.prepare(this._transaction, `
      UPDATE OR INSERT INTO AT_FIELDS (FIELDNAME, LNAME, DESCRIPTION, REFTABLE, REFCONDITION, SETTABLE, SETLISTFIELD, 
        SETCONDITION, NUMERATION)
      VALUES (:fieldName, :lName, :description, :refTable, :refCondition, :setTable, :setListField, 
        :setCondition, :numeration)
      MATCHING (FIELDNAME)
      RETURNING ID
    `);
    this._createATRelation = await this._connection.prepare(this._transaction, `
      UPDATE OR INSERT INTO AT_RELATIONS (RELATIONNAME, RELATIONTYPE, LNAME, DESCRIPTION, SEMCATEGORY)
      VALUES (:relationName, :relationType, :lName, :description, :semCategory)
      MATCHING (RELATIONNAME)
      RETURNING ID
    `);
    this._createATRelationField = await this._connection.prepare(this._transaction, `
      UPDATE OR INSERT INTO AT_RELATION_FIELDS (FIELDNAME, RELATIONNAME, FIELDSOURCE, FIELDSOURCEKEY, LNAME, DESCRIPTION, 
        SEMCATEGORY, CROSSTABLE, CROSSTABLEKEY, CROSSFIELD, ATTRNAME, MASTERENTITYNAME, ISPARENT)
      VALUES (:fieldName, :relationName, :fieldSource, :fieldSourceKey, :lName, :description, 
        :semCategory, :crossTable, :crossTableKey, :crossField, :attrName, :masterEntityName, :isParent)
      MATCHING (FIELDNAME, RELATIONNAME)
      RETURNING ID
    `);
  }

  public async dispose(): Promise<void> {
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

  public async insertATRelations(input: IInputATRelations): Promise<number> {
    if (this._createATRelation) {
      const result = await this._createATRelation.executeReturning(input);
      return result.getNumber("ID");
    } else {
      throw new Error("createATRelation is undefined");
    }
  }

  public async insertATFields(input: IInputATFields): Promise<number> {
    if (this._createATField) {
      const result = await this._createATField.executeReturning(input);
      return result.getNumber("ID");
    } else {
      throw new Error("createATField is undefined");
    }
  }

  public async insertATRelationFields(input: IInputATRelationFields): Promise<number> {
    if (this._createATRelationField) {
      const result = await this._createATRelationField.executeReturning(input);
      return result.getNumber("ID");
    } else {
      throw new Error("createATRelationField is undefined");
    }
  }
}
