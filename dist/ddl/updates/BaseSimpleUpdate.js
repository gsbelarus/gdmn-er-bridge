"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DDLHelper_1 = require("../builder/DDLHelper");
const BaseUpdate_1 = require("./BaseUpdate");
class BaseSimpleUpdate extends BaseUpdate_1.BaseUpdate {
    async run() {
        await this._executeTransaction(async (transaction) => {
            const ddHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
            try {
                await ddHelper.prepare();
                await this.internalRun(ddHelper);
            }
            finally {
                if (ddHelper.prepared) {
                    await ddHelper.dispose();
                }
            }
            await this._updateDatabaseVersion(transaction);
        });
    }
}
exports.BaseSimpleUpdate = BaseSimpleUpdate;
//# sourceMappingURL=BaseSimpleUpdate.js.map