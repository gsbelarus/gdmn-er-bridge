"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Constants_1 = require("../ddl/Constants");
const UpdateManager_1 = require("../ddl/updates/UpdateManager");
const EntitySource_1 = require("./EntitySource");
const SequenceSource_1 = require("./SequenceSource");
const Transaction_1 = require("./Transaction");
class DataSource {
    constructor(connection) {
        this._connection = connection;
    }
    async init(obj) {
        await new UpdateManager_1.UpdateManager().updateDatabase(this._connection);
        if (!Object.values(obj.sequencies).some((seq) => seq.name == Constants_1.Constants.GLOBAL_GENERATOR)) {
            obj.addSequence(new gdmn_orm_1.Sequence({ name: Constants_1.Constants.GLOBAL_GENERATOR }));
        }
        this._globalSequence = obj.sequence(Constants_1.Constants.GLOBAL_GENERATOR);
        return obj;
    }
    async startTransaction() {
        const dbTransaction = await this._connection.startTransaction();
        return new Transaction_1.Transaction(this._connection, dbTransaction);
    }
    async commitTransaction(transaction) {
        return await transaction.commit();
    }
    async rollbackTransaction(transaction) {
        return await transaction.rollback();
    }
    getEntitySource() {
        if (!this._globalSequence) {
            throw new Error("globalSequence is undefined");
        }
        return new EntitySource_1.EntitySource(this._globalSequence);
    }
    getSequenceSource() {
        return new SequenceSource_1.SequenceSource();
    }
}
exports.DataSource = DataSource;
//# sourceMappingURL=DataSource.js.map