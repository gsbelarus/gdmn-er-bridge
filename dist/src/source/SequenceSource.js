"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SequenceSource {
    constructor(dataSource) {
        this._dataSource = dataSource;
    }
    async init(obj) {
        return obj;
    }
    async create(_, obj, transaction) {
        return await this._dataSource.withTransaction(transaction, async (trans) => {
            const builder = await trans.getBuilder();
            return (await builder.addSequence(obj));
        });
    }
    async delete(_, obj, transaction) {
        return await this._dataSource.withTransaction(transaction, async (trans) => {
            const builder = await trans.getBuilder();
            await builder.removeSequence(obj);
        });
    }
}
exports.SequenceSource = SequenceSource;
//# sourceMappingURL=SequenceSource.js.map