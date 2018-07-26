"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
const gdmn_orm_1 = require("gdmn-orm");
const DDLHelper_1 = require("../DDLHelper");
const createATStructure_1 = require("./createATStructure");
const createDefaultDomains_1 = require("./createDefaultDomains");
const createDefaultGenerators_1 = require("./createDefaultGenerators");
const createDocStructure_1 = require("./createDocStructure");
const DomainResolver_1 = require("./DomainResolver");
const Prefix_1 = require("./Prefix");
class ERImport {
    constructor(connection, erModel) {
        this._connection = connection;
        this._erModel = erModel;
    }
    async execute() {
        await gdmn_db_1.AConnection.executeTransaction({
            connection: this._connection,
            callback: async (transaction) => {
                await createDefaultGenerators_1.createDefaultGenerators(this._connection, transaction);
                await createDefaultDomains_1.createDefaultDomains(this._connection, transaction);
                await createATStructure_1.createATStructure(this._connection, transaction);
                await createDocStructure_1.createDocStructure(this._connection, transaction);
            }
        });
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
        if (this._ddlHelper) {
            await this._ddlHelper.prepare();
        }
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
        if (this._ddlHelper) {
            await this._ddlHelper.dispose();
        }
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
        if (this._ddlHelper)
            return this._ddlHelper;
        throw new Error("ddlHelper is undefined");
    }
    async _scalarFieldName(attr) {
        const attrAdapter = attr.adapter;
        return attrAdapter ? attrAdapter.field : attr.name;
    }
    async _tableName(entity) {
        // TODO adapter
        return entity.name;
    }
    async _createERSchema() {
        for (const sequence of Object.values(this._erModel.sequencies)) {
            const sequenceName = sequence.adapter ? sequence.adapter.sequence : sequence.name;
            if (sequenceName !== Prefix_1.Prefix.join(createDefaultGenerators_1.G_UNIQUE_NAME, Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR)) {
                await this._getDDLHelper().addSequence(sequenceName);
            }
        }
        for (const entity of Object.values(this._erModel.entities)) {
            await this._addEntity(entity);
        }
    }
    async _addEntity(entity) {
        const tableName = await this._tableName(entity);
        const fields = [];
        const pkFields = [];
        for (const attr of Object.values(entity.attributes).filter((attr) => gdmn_orm_1.isScalarAttribute(attr))) {
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
        if (this._ddlHelper) {
            await this._ddlHelper.addTable(tableName, fields);
            await this._ddlHelper.addPrimaryKey(tableName, pkFields.map((i) => i.name));
        }
        await this._bindATEntity(entity, tableName);
    }
    async _addScalarDomain(attr) {
        const domainName = Prefix_1.Prefix.join(`${await this._getDDLHelper().nextUnique()}`, Prefix_1.Prefix.DOMAIN);
        await this._getDDLHelper().addScalarDomain(domainName, DomainResolver_1.DomainResolver.resolveScalar(attr));
        return domainName;
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