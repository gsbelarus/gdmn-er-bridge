"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SequenceSource {
    async init(obj) {
        return obj;
    }
    async create(transaction, parent, obj) {
        const builder = await transaction.getBuilder();
        return (await builder.addSequence(parent, obj));
    }
    async delete(transaction, parent, obj) {
        const builder = await transaction.getBuilder();
        await builder.removeSequence(parent, obj);
    }
}
exports.SequenceSource = SequenceSource;
//# sourceMappingURL=SequenceSource.js.map