"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ERModelBuilder_1 = require("../ddl/builder/ERModelBuilder");
class Transaction {
    constructor(connection, transaction) {
        this._builder = new ERModelBuilder_1.ERModelBuilder();
        this._connection = connection;
        this._transaction = transaction;
    }
    get finished() {
        return this._transaction.finished;
    }
    async getBuilder() {
        if (!this._builder.prepared) {
            await this._builder.prepare(this._connection, this._transaction);
        }
        return this._builder;
    }
    async commit() {
        if (this._builder.prepared) {
            await this._builder.dispose();
        }
        return await this._transaction.commit();
    }
    async rollback() {
        if (this._builder.prepared) {
            await this._builder.dispose();
        }
        return await this._transaction.rollback();
    }
}
exports.Transaction = Transaction;
//# sourceMappingURL=Transaction.js.map