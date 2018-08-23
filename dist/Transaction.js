"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ERModelBuilder_1 = require("./ddl/builder/ERModelBuilder");
class Transaction {
    constructor(transaction) {
        this._builder = new ERModelBuilder_1.ERModelBuilder();
        this._transaction = transaction;
    }
    get finished() {
        return this._transaction.finished;
    }
    get builder() {
        return this._builder;
    }
    get dbTransaction() {
        return this._transaction;
    }
    async commit() {
        return await this._transaction.commit();
    }
    async rollback() {
        return await this._transaction.rollback();
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=Transaction.js.map