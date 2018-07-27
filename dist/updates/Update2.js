"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DDLHelper_1 = require("../ddl/DDLHelper");
const Prefix_1 = require("../Prefix");
const BaseUpdate_1 = require("./BaseUpdate");
exports.GLOBAL_DDL_GENERATOR = Prefix_1.Prefix.join("DDL", Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR);
class Update2 extends BaseUpdate_1.BaseUpdate {
    constructor() {
        super(...arguments);
        this.version = 2;
    }
    async do() {
        await this._executeTransaction(async (transaction) => {
            const ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
            await ddlHelper.addSequence(exports.GLOBAL_DDL_GENERATOR);
            await this._connection.execute(transaction, `
        ALTER TABLE AT_RELATION_FIELDS
          ADD ATTRNAME            DFIELDNAME
      `);
        });
    }
}
exports.Update2 = Update2;
//# sourceMappingURL=Update2.js.map