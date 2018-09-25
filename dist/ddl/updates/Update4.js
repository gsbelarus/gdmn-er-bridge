"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseSimpleUpdate_1 = require("./BaseSimpleUpdate");
class Update4 extends BaseSimpleUpdate_1.BaseSimpleUpdate {
    constructor() {
        super(...arguments);
        this._version = 4;
        this._description = "Дополнительное поле для AT_RELATIONS";
    }
    async internalRun(ddlHelper) {
        await ddlHelper.addColumns("AT_RELATIONS", [
            { name: "ENTITYNAME", domain: "DTABLENAME" }
        ]);
    }
}
exports.Update4 = Update4;
//# sourceMappingURL=Update4.js.map