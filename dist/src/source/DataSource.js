"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
const gdmn_orm_1 = require("gdmn-orm");
const SelectBuilder_1 = require("../crud/query/SelectBuilder");
const Constants_1 = require("../ddl/Constants");
const DBSchemaUpdater_1 = require("../ddl/updates/DBSchemaUpdater");
const EntitySource_1 = require("./EntitySource");
const SequenceSource_1 = require("./SequenceSource");
const Transaction_1 = require("./Transaction");
class DataSource {
    constructor(connection) {
        this._connection = connection;
    }
    get globalSequence() {
        if (!this._globalSequence) {
            throw new Error("globalSequence is not found");
        }
        return this._globalSequence;
    }
    async init(obj) {
        await new DBSchemaUpdater_1.DBSchemaUpdater(this._connection).run();
        // TODO tmp
        this._dbStructure = await gdmn_db_1.AConnection.executeTransaction({
            connection: this._connection,
            options: { accessMode: gdmn_db_1.AccessMode.READ_ONLY },
            callback: (transaction) => gdmn_db_1.Factory.FBDriver.readDBStructure(this._connection, transaction)
        });
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
    async query(query, transaction) {
        return await this.withTransaction(transaction, async (trans) => {
            const { sql, params, fieldAliases } = new SelectBuilder_1.SelectBuilder(this._dbStructure, query).build();
            const data = await gdmn_db_1.AConnection.executeQueryResultSet({
                connection: this._connection,
                transaction: trans.dbTransaction,
                sql,
                params,
                callback: async (resultSet) => {
                    const result = [];
                    while (await resultSet.next()) {
                        const row = {};
                        for (let i = 0; i < resultSet.metadata.columnCount; i++) {
                            // TODO binary blob support
                            row[resultSet.metadata.getColumnLabel(i)] = await resultSet.getAny(i);
                        }
                        result.push(row);
                    }
                    return result;
                }
            });
            const aliases = [];
            for (const [key, value] of fieldAliases) {
                const link = query.link.deepFindLinkByField(key);
                if (!link) {
                    throw new Error("Field not found");
                }
                aliases.push({
                    alias: link.alias,
                    attribute: key.attribute.name,
                    values: value
                });
            }
            return {
                data,
                aliases,
                info: {
                    select: sql,
                    params
                }
            };
        });
    }
    getEntitySource() {
        if (!this._globalSequence) {
            throw new Error("globalSequence is undefined");
        }
        return new EntitySource_1.EntitySource(this);
    }
    getSequenceSource() {
        return new SequenceSource_1.SequenceSource(this);
    }
    async withTransaction(transaction, callback) {
        if (transaction) {
            return await callback(transaction);
        }
        else {
            const trans = await this.startTransaction();
            try {
                const result = await callback(trans);
                await trans.commit();
                return result;
            }
            catch (error) {
                await trans.rollback();
                throw error;
            }
        }
    }
}
exports.DataSource = DataSource;
//# sourceMappingURL=DataSource.js.map