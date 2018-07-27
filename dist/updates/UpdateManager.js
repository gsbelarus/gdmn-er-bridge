"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
const Update1_1 = require("./Update1");
const Update2_1 = require("./Update2");
class UpdateManager {
    constructor() {
        this.CURRENT_DATABASE_VERSION = 2;
        this._updatesConstructors = [
            Update2_1.Update2,
            Update1_1.Update1
        ];
    }
    async updateDatabase(connection) {
        const updates = this._updatesConstructors
            .map((UpdateConstructor) => new UpdateConstructor(connection));
        this.sort(updates);
        this.verifyAmount(updates);
        const version = await gdmn_db_1.AConnection.executeTransaction({
            connection,
            callback: (transaction) => this._getDBVersion(connection, transaction)
        });
        for (const update of updates) {
            if (update.version > version) {
                await update.do();
            }
        }
        await gdmn_db_1.AConnection.executeTransaction({
            connection,
            callback: (transaction) => this._updateDBVersion(connection, transaction)
        });
    }
    sort(updates) {
        updates.sort((a, b) => {
            if (a.version === b.version)
                throw new Error("Two identical versions of BaseUpdate");
            return a.version < b.version ? -1 : 1;
        });
    }
    verifyAmount(updates) {
        const lastVersion = updates.reduce((prev, cur) => {
            if (cur.version - prev !== 1) {
                throw new Error("missing update");
            }
            return cur.version;
        }, 0);
        if (lastVersion < this.CURRENT_DATABASE_VERSION) {
            throw new Error("missing update");
        }
        if (lastVersion > this.CURRENT_DATABASE_VERSION) {
            throw new Error("extra update");
        }
    }
    async _getDBVersion(connection, transaction) {
        const gdmnExists = await connection.executeReturning(transaction, `
        SELECT COUNT(1) 
        FROM RDB$RELATIONS
        WHERE RDB$RELATION_NAME = 'AT_FIELDS'
      `);
        if (gdmnExists.getBoolean("COUNT")) {
            const versionExists = await connection.executeReturning(transaction, `
        SELECT COUNT(1) 
        FROM RDB$RELATIONS
        WHERE RDB$RELATION_NAME = 'AT_DATABASE'
      `);
            if (versionExists.getBoolean("COUNT")) {
                const result = await connection.executeReturning(transaction, `
          SELECT FIRST 1
            VERSION
          FROM AT_DATABASE
        `);
                return await result.getNumber("VERSION");
            }
            return 1; // gdmn database
        }
        return 0; // clean database
    }
    async _updateDBVersion(connection, transaction) {
        await connection.execute(transaction, `
      UPDATE OR INSERT INTO AT_DATABASE (ID, VERSION)
      VALUES (1, :version)
      MATCHING (ID)
    `, {
            version: this.CURRENT_DATABASE_VERSION
        });
    }
}
exports.UpdateManager = UpdateManager;
//# sourceMappingURL=UpdateManager.js.map