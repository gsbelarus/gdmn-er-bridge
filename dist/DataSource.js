"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const UpdateManager_1 = require("./ddl/updates/UpdateManager");
const EntitySource_1 = require("./EntitySource");
const Transaction_1 = require("./Transaction");
class DataSource {
    constructor(connection) {
        this._connection = connection;
    }
    async init(obj) {
        await new UpdateManager_1.UpdateManager().updateDatabase(this._connection);
        return obj;
    }
    async startTransaction() {
        const dbTransaction = await this._connection.startTransaction();
        return new Transaction_1.Transaction(dbTransaction);
    }
    async commitTransaction(transaction) {
        return await transaction.commit();
    }
    async rollbackTransaction(transaction) {
        return await transaction.rollback();
    }
    getEntitySource() {
        return new EntitySource_1.EntitySource(this._connection);
    }
    getSequenceSource() {
        return undefined;
    }
}
exports.DataSource = DataSource;
//# sourceMappingURL=DataSource.js.map