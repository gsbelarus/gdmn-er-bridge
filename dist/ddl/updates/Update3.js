"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseSimpleUpdate_1 = require("./BaseSimpleUpdate");
class Update3 extends BaseSimpleUpdate_1.BaseSimpleUpdate {
    constructor() {
        super(...arguments);
        this._version = 3;
        this._description = "Дополнительные поля для AT_RELATION_FIELDS";
    }
    async internalRun(ddlHelper) {
        await ddlHelper.addColumns("AT_RELATION_FIELDS", [
            { name: "MASTERENTITYNAME", domain: "DTABLENAME" },
            { name: "ISPARENT", domain: "DBOOLEAN" }
        ]);
    }
}
exports.Update3 = Update3;
//# sourceMappingURL=Update3.js.map