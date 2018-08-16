"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
const Update1_1 = require("./Update1");
const Update2_1 = require("./Update2");
const Update3_1 = require("./Update3");
const Update4_1 = require("./Update4");
const Update5_1 = require("./Update5");
class UpdateManager {
    constructor() {
        this._updatesConstructors = [
            Update5_1.Update5,
            Update4_1.Update4,
            Update3_1.Update3,
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
        const newUpdates = updates.filter((item) => item.version > version);
        for (const update of newUpdates) {
            await update.run();
        }
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
        if (lastVersion < UpdateManager.CURRENT_DATABASE_VERSION) {
            throw new Error("missing update");
        }
        if (lastVersion > UpdateManager.CURRENT_DATABASE_VERSION) {
            throw new Error("extra update");
        }
    }
    async _getDBVersion(connection, transaction) {
        const gdmnExists = await connection.executeReturning(transaction, `
        SELECT COUNT(1) 
        FROM RDB$RELATIONS
        WHERE RDB$RELATION_NAME = 'AT_FIELDS'
      `);
        if (!gdmnExists.getBoolean("COUNT")) {
            return 0; // database is clean
        }
        const versionExists = await connection.executeReturning(transaction, `
      SELECT COUNT(1) 
      FROM RDB$RELATIONS
      WHERE RDB$RELATION_NAME = 'AT_DATABASE'
    `);
        if (!versionExists.getBoolean("COUNT")) {
            return 1; // database is gedemin
        }
        const result = await connection.executeReturning(transaction, `
      SELECT FIRST 1
        VERSION
      FROM AT_DATABASE
    `);
        return await result.getNumber("VERSION");
    }
}
UpdateManager.CURRENT_DATABASE_VERSION = 5;
exports.UpdateManager = UpdateManager;
//# sourceMappingURL=UpdateManager.js.map