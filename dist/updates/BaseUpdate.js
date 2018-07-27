"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
class BaseUpdate {
    constructor(connection) {
        this._connection = connection;
    }
    async _executeTransaction(callback) {
        return await gdmn_db_1.AConnection.executeTransaction({
            connection: this._connection,
            callback: callback
        });
    }
}
exports.BaseUpdate = BaseUpdate;
//# sourceMappingURL=BaseUpdate.js.map