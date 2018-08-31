"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Builder_1 = require("../ddl/builder/Builder");
const Constants_1 = require("../ddl/Constants");
const AttributeSource_1 = require("./AttributeSource");
class EntitySource {
    constructor(globalSequence) {
        this._globalSequence = globalSequence;
    }
    async init(obj) {
        if (obj.parent && !obj.hasOwnAttribute(Constants_1.Constants.DEFAULT_INHERITED_KEY_NAME)) {
            obj.add(new gdmn_orm_1.EntityAttribute({
                name: Constants_1.Constants.DEFAULT_INHERITED_KEY_NAME,
                required: true,
                lName: { ru: { name: "Родитель" } },
                entities: [obj.parent]
            }));
        }
        else if (!obj.hasOwnAttribute(Constants_1.Constants.DEFAULT_ID_NAME)) {
            obj.add(new gdmn_orm_1.SequenceAttribute({
                name: Constants_1.Constants.DEFAULT_ID_NAME,
                lName: { ru: { name: "Идентификатор" } },
                sequence: this._globalSequence,
                adapter: {
                    relation: Builder_1.Builder._getOwnRelationName(obj),
                    field: Constants_1.Constants.DEFAULT_ID_NAME
                }
            }));
        }
        return obj;
    }
    async create(transaction, _, obj) {
        const builder = await transaction.getBuilder();
        return (await builder.addEntity(obj));
    }
    async delete(transaction, _, obj) {
        const builder = await transaction.getBuilder();
        await builder.removeEntity(obj);
    }
    async addUnique(transaction, entity, attrs) {
        const builder = await transaction.getBuilder();
        return await builder.entityBuilder.addUnique(entity, attrs);
    }
    async removeUnique() {
        throw new Error("Unsupported yet");
    }
    getAttributeSource() {
        return new AttributeSource_1.AttributeSource();
    }
}
exports.EntitySource = EntitySource;
//# sourceMappingURL=EntitySource.js.map