"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DDLHelper_1 = require("../DDLHelper");
const BaseUpdate_1 = require("./BaseUpdate");
class Update3 extends BaseUpdate_1.BaseUpdate {
    constructor() {
        super(...arguments);
        this.version = 3;
    }
    async run() {
        await this._executeTransaction(async (transaction) => {
            const ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
            await ddlHelper.prepare();
            try {
                await ddlHelper.addColumns("AT_RELATION_FIELDS", [
                    { name: "MASTERENTITYNAME", domain: "DTABLENAME" },
                    { name: "ISPARENT", domain: "DBOOLEAN" }
                ]);
            }
            finally {
                await ddlHelper.dispose();
            }
            await this._updateDatabaseVersion(transaction);
        });
    }
}
exports.Update3 = Update3;
//# sourceMappingURL=Update3.js.map