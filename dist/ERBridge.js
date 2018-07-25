"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const erexport_1 = require("./export/erexport");
const ERImport_1 = require("./import/ERImport");
class ERBridge {
    constructor(connection) {
        this._connection = connection;
    }
    async exportFromDatabase(dbStructure, transaction, erModel = new gdmn_orm_1.ERModel()) {
        return await erexport_1.erExport(dbStructure, this._connection, transaction, erModel);
    }
    async importToDatabase(erModel) {
        return await new ERImport_1.ERImport(this._connection, erModel).execute();
    }
}
exports.ERBridge = ERBridge;
//# sourceMappingURL=ERBridge.js.map