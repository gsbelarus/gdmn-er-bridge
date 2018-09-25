"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Constants_1 = require("../ddl/Constants");
const DBSchemaUpdater_1 = require("../ddl/updates/DBSchemaUpdater");
const EntitySource_1 = require("./EntitySource");
const SequenceSource_1 = require("./SequenceSource");
const Transaction_1 = require("./Transaction");
class DataSource {
    constructor(connection) {
        this._connection = connection;
    }
    async init(obj) {
        await new DBSchemaUpdater_1.DBSchemaUpdater(this._connection).run();
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