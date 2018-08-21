"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Query_1 = require("./crud/query/Query");
const Builder_1 = require("./ddl/builder/Builder");
const EntityBuilder_1 = require("./ddl/builder/EntityBuilder");
const ERModelBuilder_1 = require("./ddl/builder/ERModelBuilder");
const ERExport_1 = require("./ddl/export/ERExport");
const UpdateManager_1 = require("./ddl/updates/UpdateManager");
class ERBridge {
    constructor(connection) {
        this._connection = connection;
    }
    static getERModelBuilder() {
        return new ERModelBuilder_1.ERModelBuilder();
    }
    static getEntityBuilder() {
        return new EntityBuilder_1.EntityBuilder();
    }
    async executeEntityBuilder(transaction, callback) {
        return await Builder_1.Builder.executeSelf(this._connection, transaction, ERBridge.getEntityBuilder, callback);
    }
    async executeERModelBuilder(transaction, callback) {
        return await Builder_1.Builder.executeSelf(this._connection, transaction, ERBridge.getERModelBuilder, callback);
    }
    async exportFromDatabase(dbStructure, transaction, erModel = new gdmn_orm_1.ERModel()) {
        return await new ERExport_1.ERExport(this._connection, transaction, dbStructure, erModel).execute();
        // return await erexport_old(dbStructure, this._connection, transaction, erModel);
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