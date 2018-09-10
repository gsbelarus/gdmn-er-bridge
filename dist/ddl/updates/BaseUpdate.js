"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
class BaseUpdate {
    constructor(connection) {
        this._connection = connection;
    }
    get version() {
        return this._version;
    }
    get description() {
        return `(-> v${this._version}) ${this._description}`.trim();
    }
    async _executeTransaction(callback) {
        return await gdmn_db_1.AConnection.executeTransaction({
            connection: this._connection,
            callback: callback
        });
    }
    async _updateDatabaseVersion(transaction) {
        await this._connection.execute(transaction, `
      UPDATE OR INSERT INTO AT_DATABASE (ID, VERSION)
      VALUES (1, :version)
      MATCHING (ID)
    `, {
            version: this._version
        });
    }
    async _getDatabaseVersion(transaction) {
        if (!await this._isTableExists(transaction, "AT_FIELDS")) {
            return 0;
        }
        if (!await this._isTableExists(transaction, "AT_DATABASE")) {
            return 1;
        }
        const result = await this._connection.executeReturning(transaction, `
      SELECT 
        MAX(VERSION) AS "VERSION"
      FROM AT_DATABASE
    `);
        return await result.getNumber("VERSION");
    }
    async _isTableExists(transaction, tableName) {
        const resultSet = await this._connection.executeQuery(transaction, `
      SELECT 1
      FROM RDB$RELATIONS
      WHERE RDB$RELATION_NAME = :tableName
    `, { tableName });
        try {
            return await resultSet.next();
        }
        finally {
            if (!resultSet.closed) {
                await resultSet.close();
            }
        }
    }
}
exports.BaseUpdate = BaseUpdate;
//# sourceMappingURL=BaseUpdate.js.map