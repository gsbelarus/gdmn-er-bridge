"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AttributeSource {
    constructor(dataSource) {
        this._dataSource = dataSource;
    }
    async init(obj) {
        return obj;
    }
    async create(parent, obj, transaction) {
        return await this._dataSource.withTransaction(transaction, async (trans) => {
            const builder = await trans.getBuilder();
            return (await builder.entityBuilder.addAttribute(parent, obj));
        });
    }
    async delete(parent, obj, transaction) {
        return await this._dataSource.withTransaction(transaction, async (trans) => {
            const builder = await trans.getBuilder();
            await builder.entityBuilder.removeAttribute(parent, obj);
        });
    }
}
exports.AttributeSource = AttributeSource;
//# sourceMappingURL=AttributeSource.js.map