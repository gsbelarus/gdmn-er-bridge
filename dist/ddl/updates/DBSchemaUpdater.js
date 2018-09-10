"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseUpdate_1 = require("./BaseUpdate");
const Update1_1 = require("./Update1");
const Update2_1 = require("./Update2");
const Update3_1 = require("./Update3");
const Update4_1 = require("./Update4");
const Update5_1 = require("./Update5");
const CURRENT_DATABASE_VERSION = 5;
const UPDATES_LIST = [
    Update5_1.Update5,
    Update4_1.Update4,
    Update3_1.Update3,
    Update2_1.Update2,
    Update1_1.Update1
];
class DBSchemaUpdater extends BaseUpdate_1.BaseUpdate {
    constructor() {
        super(...arguments);
        this._version = CURRENT_DATABASE_VERSION;
        this._description = "Обновление структуры базы данных";
    }
    async run() {
        const updates = UPDATES_LIST.map((UpdateConstructor) => new UpdateConstructor(this._connection));
        this._sort(updates);
        this._verifyAmount(updates);
        const version = await this._executeTransaction((transaction) => this._getDatabaseVersion(transaction));
        const newUpdates = updates.filter((item) => item.version > version);
        console.log("Обновление структуры базы данных...");
        console.time(this._description);
        for (const update of newUpdates) {
            console.time(update.description);
            await update.run();
            console.timeEnd(update.description);
        }
        console.timeEnd(this._description);
    }
    _sort(updates) {
        updates.sort((a, b) => {
            if (a.version === b.version)
                throw new Error("Two identical versions of BaseUpdate");
            return a.version < b.version ? -1 : 1;
        });
    }
    _verifyAmount(updates) {
        const lastVersion = updates.reduce((prev, cur) => {
            if (cur.version - prev !== 1) {
                throw new Error("missing update");
            }
            return cur.version;
        }, 0);
        if (lastVersion < this._version) {
            throw new Error("missing update");
        }
        if (lastVersion > this._version) {
            throw new Error("extra update");
        }
    }
}
exports.DBSchemaUpdater = DBSchemaUpdater;
//# sourceMappingURL=DBSchemaUpdater.js.map