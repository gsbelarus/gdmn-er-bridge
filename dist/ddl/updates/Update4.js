"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DDLHelper_1 = require("../builder/DDLHelper");
const BaseUpdate_1 = require("./BaseUpdate");
class Update4 extends BaseUpdate_1.BaseUpdate {
    constructor() {
        super(...arguments);
        this.version = 4;
    }
    async run() {
        await this._executeTransaction(async (transaction) => {
            const ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
            await ddlHelper.prepare();
            try {
                await ddlHelper.addColumns("AT_RELATIONS", [
                    { name: "ENTITYNAME", domain: "DTABLENAME" }
                ]);
            }
            finally {
                await ddlHelper.dispose();
            }
            await this._updateDatabaseVersion(transaction);
        });
    }
}
exports.Update4 = Update4;
//# sourceMappingURL=Update4.js.map