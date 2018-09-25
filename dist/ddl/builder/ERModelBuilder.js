"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Builder_1 = require("./Builder");
const DDLHelper_1 = require("./DDLHelper");
const DomainResolver_1 = require("./DomainResolver");
const EntityBuilder_1 = require("./EntityBuilder");
class ERModelBuilder extends Builder_1.Builder {
    get entityBuilder() {
        if (!this._entityBuilder || !this._entityBuilder.prepared) {
            throw new Error("Need call prepare");
        }
        return this._entityBuilder;
    }
    async prepare(connection, transaction) {
        await super.prepare(connection, transaction);
        this._entityBuilder = new EntityBuilder_1.EntityBuilder(this._getDDLHelper(), this._getATHelper());
    }
    async addSequence(sequence) {
        // TODO custom adapter name
        await this._getDDLHelper().addSequence(sequence.name);
        return sequence;
    }
    async removeSequence(_sequence) {
        // TODO
        throw new Error("Unsupported yet");
    }
    async addEntity(entity) {
        const tableName = Builder_1.Builder._getOwnRelationName(entity);
        const fields = [];
        for (const pkAttr of entity.pk) {
            const fieldName = Builder_1.Builder._getFieldName(pkAttr);
            const domainName = await this._getDDLHelper().addDomain(DomainResolver_1.DomainResolver.resolve(pkAttr));
            await this._insertATAttr(pkAttr, { relationName: tableName, fieldName, domainName });
            fields.push({
                name: fieldName,
                domain: domainName
            });
        }
        await this._getDDLHelper().addTable(tableName, fields);
        await this._getDDLHelper().addPrimaryKey(tableName, fields.map((i) => i.name));
        await this._insertATEntity(entity, { relationName: tableName });
        for (const pkAttr of entity.pk) {
            if (gdmn_orm_1.SequenceAttribute.isType(pkAttr)) {
                const fieldName = Builder_1.Builder._getFieldName(pkAttr);
                const seqAdapter = pkAttr.sequence.adapter;
                await this._getDDLHelper().addAutoIncrementTrigger(tableName, fieldName, seqAdapter ? seqAdapter.sequence : pkAttr.sequence.name);
            }
            else if (gdmn_orm_1.DetailAttribute.isType(pkAttr)) {
                // ignore
            }
            else if (gdmn_orm_1.ParentAttribute.isType(pkAttr)) {
                // ignore
            }
            else if (gdmn_orm_1.SetAttribute.isType(pkAttr)) {
                // ignore
            }
            else if (gdmn_orm_1.EntityAttribute.isType(pkAttr)) { // for inheritance
                const fieldName = Builder_1.Builder._getFieldName(pkAttr);
                await this._getDDLHelper().addForeignKey(DDLHelper_1.DDLHelper.DEFAULT_FK_OPTIONS, {
                    tableName,
                    fieldName
                }, {
                    tableName: Builder_1.Builder._getOwnRelationName(pkAttr.entities[0]),
                    fieldName: Builder_1.Builder._getFieldName(pkAttr.entities[0].pk[0])
                });
            }
        }
        for (const attr of Object.values(entity.ownAttributes)) {
            if (!entity.pk.includes(attr)) {
                await this.entityBuilder.addAttribute(entity, attr);
            }
        }
        for (const unique of entity.unique) {
            await this.entityBuilder.addUnique(entity, unique);
        }
        return entity;
    }
    removeEntity(_entity) {
        // TODO
        throw new Error("Unsupported yet");
    }
}
exports.ERModelBuilder = ERModelBuilder;
//# sourceMappingURL=ERModelBuilder.js.map