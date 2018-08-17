"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DDLHelper_1 = require("../builder/DDLHelper");
const BaseUpdate_1 = require("./BaseUpdate");
class Update5 extends BaseUpdate_1.BaseUpdate {
    constructor() {
        super(...arguments);
        this.version = 5;
    }
    async run() {
        await this._executeTransaction(async (transaction) => {
            const ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
            await ddlHelper.prepare();
            try {
                await ddlHelper.addColumns("AT_RELATION_FIELDS", [
                    { name: "LBFIELDNAME", domain: "DFIELDNAME" },
                    { name: "RBFIELDNAME", domain: "DFIELDNAME" }
                ]);
            }
            finally {
                await ddlHelper.dispose();
            }
            await this._updateDatabaseVersion(transaction);
        });
    }
}
exports.Update5 = Update5;
//# sourceMappingURL=Update5.js.map