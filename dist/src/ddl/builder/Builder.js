"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_nlp_1 = require("gdmn-nlp");
const gdmn_orm_1 = require("gdmn-orm");
const ATHelper_1 = require("./ATHelper");
const DDLHelper_1 = require("./DDLHelper");
class Builder {
    constructor(ddlHelper, atHelper) {
        this._ddlHelper = ddlHelper;
        this._atHelper = atHelper;
        if ((ddlHelper || atHelper) && !this.prepared) {
            throw new Error("ddlHelper or atHelper are not prepared");
        }
    }
    get prepared() {
        return !!this._ddlHelper && this._ddlHelper.prepared && !!this._atHelper && this._atHelper.prepared;
    }
    static async executeSelf(connection, transaction, selfReceiver, callback) {
        let self;
        try {
            self = await selfReceiver(null);
            await self.prepare(connection, transaction);
            return await callback(self);
        }
        finally {
            if (self && self.prepared) {
                await self.dispose();
            }
        }
    }
    static _getOwnRelationName(entity) {
        if (entity.adapter) {
            const relations = entity.adapter.relation.filter((rel) => !rel.weak);
            if (relations.length) {
                return relations[relations.length - 1].relationName;
            }
        }
        return entity.name;
    }
    static _getFieldName(attr) {
        if (gdmn_orm_1.SetAttribute.isType(attr)) {
            if (attr.adapter && attr.adapter.presentationField)
                return attr.adapter.presentationField;
        }
        else if (gdmn_orm_1.EntityAttribute.isType(attr) || gdmn_orm_1.ScalarAttribute.isType(attr)) {
            if (attr.adapter)
                return attr.adapter.field;
        }
        return attr.name;
    }
    async prepare(connection, transaction) {
        this._ddlHelper = new DDLHelper_1.DDLHelper(connection, transaction);
        this._atHelper = new ATHelper_1.ATHelper(connection, transaction);
        await this._getDDLHelper().prepare();
        await this._getATHelper().prepare();
    }
    async dispose() {
        console.debug(this._getDDLHelper().logs.join("\n"));
        await this._getDDLHelper().dispose();
        await this._getATHelper().dispose();
        this._ddlHelper = undefined;
        this._atHelper = undefined;
    }
    _getDDLHelper() {
        if (this._ddlHelper) {
            return this._ddlHelper;
        }
        throw new Error("Need call prepare");
    }
    _getATHelper() {
        if (this._atHelper) {
            return this._atHelper;
        }
        throw new Error("Need call prepare");
    }
    async _insertATEntity(entity, options) {
        return await this._getATHelper().insertATRelations({
            relationName: options.relationName,
            relationType: "T",
            lName: entity.lName.ru ? entity.lName.ru.name : entity.name,
            description: entity.lName.ru ? entity.lName.ru.fullName : entity.name,
            entityName: options.relationName !== entity.name ? entity.name : undefined,
            semCategory: gdmn_nlp_1.semCategories2Str(entity.semCategories)
        });
    }
    async _insertATAttr(attr, options) {
        const numeration = gdmn_orm_1.EnumAttribute.isType(attr)
            ? attr.values.map(({ value, lName }) => `${value}=${lName && lName.ru ? lName.ru.name : ""}`).join("#13#10")
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
            masterEntityName: options.masterEntity ? options.masterEntity.name : undefined,
            fieldSource: options.domainName,
            fieldSourceKey,
            semCategory: gdmn_nlp_1.semCategories2Str(attr.semCategories),
            crossTable: options.crossTable,
            crossTableKey: options.crossTableKey,
            crossField: options.crossField
        });
    }
}
exports.Builder = Builder;
//# sourceMappingURL=Builder.js.map