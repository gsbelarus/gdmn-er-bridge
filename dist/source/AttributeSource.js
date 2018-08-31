"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AttributeSource {
    async init(obj) {
        return obj;
    }
    async create(transaction, parent, obj) {
        const builder = await transaction.getBuilder();
        return (await builder.entityBuilder.addAttribute(parent, obj));
    }
    async delete(transaction, parent, obj) {
        const builder = await transaction.getBuilder();
        await builder.entityBuilder.removeAttribute(parent, obj);
    }
}
exports.AttributeSource = AttributeSource;
//# sourceMappingURL=AttributeSource.js.map