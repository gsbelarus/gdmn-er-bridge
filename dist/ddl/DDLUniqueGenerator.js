"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("./Constants");
class DDLUniqueGenerator {
    get prepared() {
        return !!this._nextUnique && !this._nextUnique.disposed;
    }
    async prepare(connection, transaction) {
        this._nextUnique = await connection.prepare(transaction, `SELECT NEXT VALUE FOR ${Constants_1.Constants.GLOBAL_DDL_GENERATOR} FROM RDB$DATABASE`);
    }
    async dispose() {
        await this.getNextUnique().dispose();
        this._nextUnique = undefined;
    }
    async next() {
        const result = await this.getNextUnique().executeReturning();
        return (await result.getAll())[0];
    }
    getNextUnique() {
        if (this._nextUnique) {
            return this._nextUnique;
        }
        throw new Error("should call prepare");
    }
}
exports.DDLUniqueGenerator = DDLUniqueGenerator;
//# sourceMappingURL=DDLUniqueGenerator.js.map