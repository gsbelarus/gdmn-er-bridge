"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ATHelper {
    constructor(connection, transaction) {
        this._connection = connection;
        this._transaction = transaction;
    }
    async prepare() {
        this._createATField = await this._connection.prepare(this._transaction, `
      INSERT INTO AT_FIELDS (FIELDNAME, LNAME, DESCRIPTION, REFTABLE, REFCONDITION, SETTABLE, SETLISTFIELD, 
        SETCONDITION, NUMERATION)
      VALUES (:fieldName, :lName, :description, :refTable, :refCondition, :setTable, :setListField, 
        :setCondition, :numeration)
      RETURNING ID
    `);
        this._createATRelation = await this._connection.prepare(this._transaction, `
      INSERT INTO AT_RELATIONS (RELATIONNAME, RELATIONTYPE, LNAME, DESCRIPTION, SEMCATEGORY, ENTITYNAME)
      VALUES (:relationName, :relationType, :lName, :description, :semCategory, :entityName)
      RETURNING ID
    `);
        this._createATRelationField = await this._connection.prepare(this._transaction, `
      INSERT INTO AT_RELATION_FIELDS (FIELDNAME, RELATIONNAME, FIELDSOURCE, FIELDSOURCEKEY, LNAME, DESCRIPTION, 
        SEMCATEGORY, CROSSTABLE, CROSSTABLEKEY, CROSSFIELD, ATTRNAME, MASTERENTITYNAME, ISPARENT,
        LBFIELDNAME, RBFIELDNAME)
      VALUES (:fieldName, :relationName, :fieldSource, :fieldSourceKey, :lName, :description, 
        :semCategory, :crossTable, :crossTableKey, :crossField, :attrName, :masterEntityName, :isParent,
        :lbFieldName, :rbFieldName)
      RETURNING ID
    `);
    }
    async dispose() {
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
    async insertATRelations(input) {
        if (this._createATRelation) {
            const result = await this._createATRelation.executeReturning(input);
            return result.getNumber("ID");
        }
        else {
            throw new Error("createATRelation is undefined");
        }
    }
    async insertATFields(input) {
        if (this._createATField) {
            const result = await this._createATField.executeReturning(input);
            return result.getNumber("ID");
        }
        else {
            throw new Error("createATField is undefined");
        }
    }
    async insertATRelationFields(input) {
        if (this._createATRelationField) {
            const result = await this._createATRelationField.executeReturning(input);
            return result.getNumber("ID");
        }
        else {
            throw new Error("createATRelationField is undefined");
        }
    }
}
exports.ATHelper = ATHelper;
//# sourceMappingURL=ATHelper.js.map