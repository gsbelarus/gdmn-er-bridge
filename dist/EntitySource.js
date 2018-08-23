"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntitySource {
    constructor(connection) {
        this._connection = connection;
    }
    async init(obj) {
        return obj;
    }
    async create(transaction, parent, obj) {
        return (await transaction.builder.addEntity(parent, obj));
    }
    async delete() {
        throw new Error("Unsupported yet");
    }
    async addUnique(transaction, attrs) {
        return await transaction.builder.entityBuilder.addUnique();
    }
    async removeUnique(transaction, attrs) {
        return undefined;
    }
    getAttributeSource() {
        return undefined;
    }
}
exports.EntitySource = EntitySource;
//# sourceMappingURL=EntitySource.js.map