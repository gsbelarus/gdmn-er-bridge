"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseSimpleUpdate_1 = require("./BaseSimpleUpdate");
class Update5 extends BaseSimpleUpdate_1.BaseSimpleUpdate {
    constructor() {
        super(...arguments);
        this._version = 5;
        this._description = "Дополнительные поля для AT_RELATION_FIELDS";
    }
    async internalRun(ddlHelper) {
        await ddlHelper.addColumns("AT_RELATION_FIELDS", [
            { name: "LBFIELDNAME", domain: "DFIELDNAME" },
            { name: "RBFIELDNAME", domain: "DFIELDNAME" }
        ]);
    }
}
exports.Update5 = Update5;
//# sourceMappingURL=Update5.js.map