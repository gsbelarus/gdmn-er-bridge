"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Constants_1 = require("../Constants");
const Builder_1 = require("./Builder");
const DDLHelper_1 = require("./DDLHelper");
const DomainResolver_1 = require("./DomainResolver");
class EntityBuilder extends Builder_1.Builder {
    async addUnique(entity, attrs) {
        const tableName = Builder_1.Builder._getOwnRelationName(entity);
        await this._getDDLHelper().addUnique(tableName, attrs.map((attr) => Builder_1.Builder._getFieldName(attr)));
    }
    async addAttribute(entity, attr) {
        const tableName = Builder_1.Builder._getOwnRelationName(entity);
        if (gdmn_orm_1.ScalarAttribute.isType(attr)) {
            const fieldName = Builder_1.Builder._getFieldName(attr);
            const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(attr));
            await this._getDDLHelper().addColumns(tableName, [{ name: fieldName, domain: domainName }]);
            await this._insertATAttr(attr, { relationName: tableName, fieldName, domainName });
            if (gdmn_orm_1.SequenceAttribute.isType(attr)) {
                const seqName = attr.sequence.adapter ? attr.sequence.adapter.sequence : attr.sequence.name;
                await this._getDDLHelper().addAutoIncrementTrigger(tableName, fieldName, seqName);
            }
        }
        else if (gdmn_orm_1.DetailAttribute.isType(attr)) {
            const fieldName = Builder_1.Builder._getFieldName(entity.pk[0]);
            let detailTableName;
            let detailLinkFieldName;
            if (attr.adapter && attr.adapter.masterLinks.length) {
                detailTableName = attr.adapter.masterLinks[0].detailRelation;
                detailLinkFieldName = attr.adapter.masterLinks[0].link2masterField;
            }
            else {
                detailTableName = attr.name;
                detailLinkFieldName = Constants_1.Constants.DEFAULT_MASTER_KEY_NAME;
            }
            const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(attr));
            await this._getDDLHelper().addColumns(detailTableName, [{ name: detailLinkFieldName, domain: domainName }]);
            await this._getDDLHelper().addForeignKey(DDLHelper_1.DDLHelper.DEFAULT_FK_OPTIONS, {
                tableName: detailTableName,
                fieldName: detailLinkFieldName
            }, {
                tableName,
                fieldName
            });
            await this._insertATAttr(attr, {
                relationName: detailTableName,
                fieldName: detailLinkFieldName,
                domainName: domainName,
                masterEntity: entity
            });
        }
        else if (gdmn_orm_1.SetAttribute.isType(attr)) {
            // create cross table
            const fields = [];
            const pkFields = [];
            const ownPKDomainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(entity.pk[0]));
            const ownPK = {
                name: Constants_1.Constants.DEFAULT_CROSS_PK_OWN_NAME,
                domain: ownPKDomainName
            };
            fields.push(ownPK);
            pkFields.push(ownPK);
            const refPKDomainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(attr.entities[0].pk[0]));
            const refPK = {
                name: Constants_1.Constants.DEFAULT_CROSS_PK_REF_NAME,
                domain: refPKDomainName
            };
            fields.push(refPK);
            pkFields.push(refPK);
            for (const crossAttr of Object.values(attr.attributes).filter((attr) => gdmn_orm_1.ScalarAttribute.isType(attr))) {
                const fieldName = Builder_1.Builder._getFieldName(crossAttr);
                const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(crossAttr));
                fields.push({
                    attr: crossAttr,
                    name: fieldName,
                    domain: domainName
                });
            }
            let crossTableName;
            if (attr.adapter) {
                crossTableName = await this._getDDLHelper().addTable(attr.adapter.crossRelation, fields);
            }
            else {
                crossTableName = await this._getDDLHelper().addTable(fields);
            }
            await this._getDDLHelper().addPrimaryKey(crossTableName, pkFields.map((i) => i.name));
            for (const field of fields) {
                if (field.attr) {
                    await this._insertATAttr(field.attr, {
                        relationName: crossTableName,
                        fieldName: field.name,
                        domainName: field.domain
                    });
                }
                else {
                    // await this._getATHelper().insertATRelationFields();
                }
            }
            const crossTableKey = await this._getATHelper().insertATRelations({
                relationName: crossTableName,
                relationType: "T",
                lName: crossTableName,
                description: crossTableName,
                entityName: undefined,
                semCategory: undefined
            });
            // create own table column
            const fieldName = Builder_1.Builder._getFieldName(attr);
            const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(attr));
            await this._getDDLHelper().addColumns(tableName, [{ name: fieldName, domain: domainName }]);
            await this._insertATAttr(attr, {
                relationName: tableName,
                fieldName,
                domainName,
                crossTable: crossTableName,
                crossTableKey
            });
            // add foreign keys for cross table
            await this._getDDLHelper().addForeignKey(DDLHelper_1.DDLHelper.DEFAULT_FK_OPTIONS, {
                tableName: crossTableName,
                fieldName: Constants_1.Constants.DEFAULT_CROSS_PK_OWN_NAME
            }, {
                tableName: Builder_1.Builder._getOwnRelationName(entity),
                fieldName: Builder_1.Builder._getFieldName(entity.pk[0])
            });
            await this._getDDLHelper().addForeignKey(DDLHelper_1.DDLHelper.DEFAULT_FK_OPTIONS, {
                tableName: crossTableName,
                fieldName: Constants_1.Constants.DEFAULT_CROSS_PK_REF_NAME
            }, {
                tableName: Builder_1.Builder._getOwnRelationName(attr.entities[0]),
                fieldName: Builder_1.Builder._getFieldName(attr.entities[0].pk[0])
            });
        }
        else if (gdmn_orm_1.ParentAttribute.isType(attr)) {
            const fieldName = Builder_1.Builder._getFieldName(attr);
            const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(attr));
            await this._getDDLHelper().addColumns(tableName, [{ name: fieldName, domain: domainName }]);
            await this._insertATAttr(attr, { relationName: tableName, fieldName, domainName });
            /*
            const lbField = attr.adapter ? attr.adapter.lbField : Constants.DEFAULT_LB_NAME;
            const rbField = attr.adapter ? attr.adapter.rbField : Constants.DEFAULT_RB_NAME;
            await this._getDDLHelper().addColumns(tableName, [{name: lbField, domain: "DLB"}]);
            await this._getDDLHelper().addColumns(tableName, [{name: rbField, domain: "DRB"}]);
            await this._getDDLHelper().createIndex(tableName, "ASC", [lbField]);
            await this._getDDLHelper().createIndex(tableName, "DESC", [rbField]);
            await this._getDDLHelper().addTableCheck(tableName, [`${lbField} <= ${rbField}`]);
            */
            await this._getDDLHelper().addForeignKey({
                onUpdate: "CASCADE",
                onDelete: "CASCADE"
            }, {
                tableName,
                fieldName
            }, {
                tableName: Builder_1.Builder._getOwnRelationName(attr.entities[0]),
                fieldName: Builder_1.Builder._getFieldName(attr.entities[0].pk[0])
            });
        }
        else if (gdmn_orm_1.EntityAttribute.isType(attr)) {
            const fieldName = Builder_1.Builder._getFieldName(attr);
            const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(attr));
            await this._getDDLHelper().addColumns(tableName, [{ name: fieldName, domain: domainName }]);
            await this._insertATAttr(attr, { relationName: tableName, fieldName, domainName });
            await this._getDDLHelper().addForeignKey(DDLHelper_1.DDLHelper.DEFAULT_FK_OPTIONS, {
                tableName,
                fieldName
            }, {
                tableName: Builder_1.Builder._getOwnRelationName(attr.entities[0]),
                fieldName: Builder_1.Builder._getFieldName(attr.entities[0].pk[0])
            });
        }
        return attr;
    }
    async removeAttribute(_entity, _attribute) {
        // TODO
        throw new Error("Unsupported yet");
    }
}
exports.EntityBuilder = EntityBuilder;
//# sourceMappingURL=EntityBuilder.js.map