"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("../Constants");
const DDLHelper_1 = require("../DDLHelper");
const BaseUpdate_1 = require("./BaseUpdate");
// Update for creating gdmn-back adapted database
class Update2 extends BaseUpdate_1.BaseUpdate {
    constructor() {
        super(...arguments);
        this.version = 2;
    }
    async run() {
        await this._executeTransaction(async (transaction) => {
            const ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
            await ddlHelper.addSequence(Constants_1.Constants.GLOBAL_DDL_GENERATOR);
            await ddlHelper.prepare();
            try {
                await ddlHelper.addTable("AT_DATABASE", [
                    { name: "ID", domain: "DINTKEY" },
                    { name: "VERSION", domain: "DINTKEY" }
                ]);
                await ddlHelper.addPrimaryKey("AT_PK_DATABASE", "AT_DATABASE", ["ID"]);
                await ddlHelper.addColumns("AT_RELATION_FIELDS", [
                    { name: "ATTRNAME", domain: "DFIELDNAME" }
                ]);
            }
            finally {
                await ddlHelper.dispose();
            }
        });
        await this._executeTransaction((transaction) => this._updateDatabaseVersion(transaction));
    }
}
exports.Update2 = Update2;
//# sourceMappingURL=Update2.js.map