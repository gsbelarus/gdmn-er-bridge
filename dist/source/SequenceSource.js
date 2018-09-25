"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SequenceSource {
    async init(obj) {
        return obj;
    }
    async create(transaction, _, obj) {
        const builder = await transaction.getBuilder();
        return (await builder.addSequence(obj));
    }
    async delete(transaction, _, obj) {
        const builder = await transaction.getBuilder();
        await builder.removeSequence(obj);
    }
}
exports.SequenceSource = SequenceSource;
//# sourceMappingURL=SequenceSource.js.map