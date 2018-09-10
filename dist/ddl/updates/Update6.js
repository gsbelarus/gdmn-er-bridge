"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseSimpleUpdate_1 = require("./BaseSimpleUpdate");
class Update6 extends BaseSimpleUpdate_1.BaseSimpleUpdate {
    constructor() {
        super(...arguments);
        this._version = 6;
        this._description = "Дополнительные поля для AT_DATABASE";
    }
    async internalRun(ddlHelper) {
        await ddlHelper.addColumns("AT_DATABASE", [
            { name: "UPGRADED", domain: "DTIMESTAMP_NOTNULL", default: "CURRENT_TIMESTAMP" }
        ]);
        await ddlHelper.addUnique("AT_DATABASE", ["VERSION"]);
    }
}
exports.Update6 = Update6;
//# sourceMappingURL=Update6.js.map