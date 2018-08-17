"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Query_1 = require("./crud/query/Query");
const EntityBuilder_1 = require("./ddl/builder/EntityBuilder");
const ERImport_1 = require("./ddl/builder/ERImport");
const ERModelBuilder_1 = require("./ddl/builder/ERModelBuilder");
const ERExport2_1 = require("./ddl/export/ERExport2");
const UpdateManager_1 = require("./ddl/updates/UpdateManager");
class ERBridge {
    constructor(connection) {
        this._connection = connection;
    }
    static async getERModelBuilder() {
        return new ERModelBuilder_1.ERModelBuilder();
    }
    static async getEntityBuilder() {
        return new EntityBuilder_1.EntityBuilder();
    }
    async exportFromDatabase(dbStructure, transaction, erModel = new gdmn_orm_1.ERModel()) {
        return await new ERExport2_1.ERExport2(this._connection, transaction, dbStructure, erModel).execute();
        // return await erExport(dbStructure, this._connection, transaction, erModel);
    }
    async importToDatabase(erModel) {
        return await new ERImport_1.ERImport(this._connection, erModel).execute();
    }
    async initDatabase() {
        await new UpdateManager_1.UpdateManager().updateDatabase(this._connection);
    }
    async query(erModel, dbStructure, query) {
        return await Query_1.Query.execute(this._connection, erModel, dbStructure, query);
    }
}
exports.ERBridge = ERBridge;
//# sourceMappingURL=ERBridge.js.map