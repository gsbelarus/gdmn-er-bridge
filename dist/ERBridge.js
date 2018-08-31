"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Query_1 = require("./crud/query/Query");
const ERExport_1 = require("./ddl/export/ERExport");
class ERBridge {
    constructor(connection) {
        this._connection = connection;
    }
    async exportFromDatabase(dbStructure, transaction, erModel = new gdmn_orm_1.ERModel()) {
        return await new ERExport_1.ERExport(this._connection, transaction, dbStructure, erModel).execute();
        // return await erexport_old(dbStructure, this._connection, transaction, erModel);
    }
    async query(erModel, dbStructure, query) {
        return await Query_1.Query.execute(this._connection, erModel, dbStructure, query);
    }
}
exports.ERBridge = ERBridge;
//# sourceMappingURL=ERBridge.js.map