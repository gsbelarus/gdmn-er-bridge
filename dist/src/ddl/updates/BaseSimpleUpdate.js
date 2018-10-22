"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DDLHelper_1 = require("../builder/DDLHelper");
const BaseUpdate_1 = require("./BaseUpdate");
class BaseSimpleUpdate extends BaseUpdate_1.BaseUpdate {
    async run() {
        await this._executeTransaction(async (transaction) => {
            const ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
            try {
                await ddlHelper.prepare();
                await this.internalRun(ddlHelper);
                await this._updateDatabaseVersion(transaction);
            }
            finally {
                console.debug(ddlHelper.logs.join("\n"));
                if (ddlHelper.prepared) {
                    await ddlHelper.dispose();
                }
            }
        });
    }
}
exports.BaseSimpleUpdate = BaseSimpleUpdate;
//# sourceMappingURL=BaseSimpleUpdate.js.map