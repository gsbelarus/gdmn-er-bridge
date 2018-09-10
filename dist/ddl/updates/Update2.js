"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DDLHelper_1 = require("../builder/DDLHelper");
const Constants_1 = require("../Constants");
const BaseUpdate_1 = require("./BaseUpdate");
class Update2 extends BaseUpdate_1.BaseUpdate {
    constructor() {
        super(...arguments);
        this._version = 2;
        this._description = "Обновление для бд Гедымина, включающее поддержку gdmn web";
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
                console.debug(ddlHelper.logs.join("\n"));
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