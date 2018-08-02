"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
const gdmn_orm_1 = require("gdmn-orm");
const DDLHelper_1 = require("../ddl/DDLHelper");
const Update1_1 = require("../updates/Update1");
const DomainResolver_1 = require("./DomainResolver");
class ERImport {
    constructor(connection, erModel) {
        this._connection = connection;
        this._erModel = erModel;
    }
    static _getScalarFieldName(attr) {
        const attrAdapter = attr.adapter;
        return attrAdapter ? attrAdapter.field : attr.name;
    }
    async execute() {
        await gdmn_db_1.AConnection.executeTransaction({
            connection: this._connection,
            callback: async (transaction) => {
                this._ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
                try {
                    await this._prepareStatements(transaction);
                    await this._createERSchema();
                    await this._disposeStatements();
                }
                finally {
                    console.debug(this._ddlHelper.logs.join("\n"));
                }
            }
        });
    }
    async _prepareStatements(transaction) {
        await this._getDDLHelper().prepare();
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
    async _disposeStatements() {
        await this._getDDLHelper().dispose();
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
    _getDDLHelper() {
        if (this._ddlHelper) {
            return this._ddlHelper;
        }
        throw new Error("ddlHelper is undefined");
    }
    async _createERSchema() {
        for (const sequence of Object.values(this._erModel.sequencies)) {
            const sequenceName = sequence.adapter ? sequence.adapter.sequence : sequence.name;
            if (sequenceName !== Update1_1.GLOBAL_GENERATOR) {
                await this._getDDLHelper().addSequence(sequenceName);
            }
        }
        for (const entity of Object.values(this._erModel.entities)) {
            await this._addEntity(entity);
        }
        for (const entity of Object.values(this._erModel.entities)) {
            await this._addLinks(entity);
        }
    }
    async _addLinks(entity) {
        for (const attr of Object.values(entity.attributes).filter((attr) => gdmn_orm_1.isEntityAttribute(attr))) {
            if (gdmn_orm_1.isParentAttribute(attr)) {
            }
            else if (gdmn_orm_1.isDetailAttribute(attr)) {
                const tableName = entity.name;
                const fieldName = ERImport._getScalarFieldName(entity.pk[0]);
                const adapter = attr.adapter;
                const detailTableName = adapter.masterLinks[0].detailRelation;
                const detailFieldName = adapter.masterLinks[0].link2masterField;
                const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(attr));
                await this._getDDLHelper().addColumns(detailTableName, [{ name: detailFieldName, domain: domainName }]);
                await this._getDDLHelper().addForeignKey({
                    tableName: detailTableName,
                    fieldName: detailFieldName
                }, {
                    tableName,
                    fieldName
                });
                await this._bindATAttr(attr, detailTableName, detailFieldName, domainName);
            }
            else if (gdmn_orm_1.isSetAttribute(attr)) {
            }
            else if (gdmn_orm_1.isEntityAttribute(attr)) {
                const tableName = entity.name;
                const fieldName = attr.name;
                const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(attr));
                await this._getDDLHelper().addColumns(tableName, [{ name: fieldName, domain: domainName }]);
                await this._getDDLHelper().addForeignKey({
                    tableName,
                    fieldName
                }, {
                    tableName: attr.entity[0].name,
                    fieldName: attr.entity[0].pk[0].name
                });
                await this._bindATAttr(attr, tableName, fieldName, domainName);
            }
        }
    }
    async _addEntity(entity) {
        const tableName = entity.name;
        const fields = [];
        const pkFields = [];
        for (const attr of Object.values(entity.attributes).filter((attr) => gdmn_orm_1.isScalarAttribute(attr))) {
            const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(attr));
            const fieldName = ERImport._getScalarFieldName(attr);
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
    async _bindATEntity(entity, tableName) {
        if (this._createATRelation) {
            await this._createATRelation.execute({
                tableName,
                lName: entity.lName.ru ? entity.lName.ru.name : entity.name,
                description: entity.lName.ru ? entity.lName.ru.fullName : entity.name
            });
        }
        else {
            throw new Error("createATRelation is undefined");
        }
    }
    async _bindATAttr(attr, tableName, fieldName, domainName) {
        const numeration = gdmn_orm_1.isEnumAttribute(attr)
            ? attr.values.map(({ value, lName }) => `${value}=${lName && lName.ru ? lName.ru.name : ""}`).join("#13#10")
            : undefined;
        if (this._createATField) {
            await this._createATField.execute({
                fieldName: domainName,
                lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
                description: attr.lName.ru ? attr.lName.ru.fullName : attr.name,
                numeration: numeration ? Buffer.from(numeration) : undefined
            });
        }
        else {
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
        }
        else {
            throw new Error("createATRelationField is undefined");
        }
    }
}
exports.ERImport = ERImport;
//# sourceMappingURL=ERImport.js.map