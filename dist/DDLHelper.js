"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const createDefaultGenerators_1 = require("./import/createDefaultGenerators");
const Prefix_1 = require("./import/Prefix");
class DDLHelper {
    constructor(connection, transaction) {
        this._logs = [];
        this._connection = connection;
        this._transaction = transaction;
    }
    get logs() {
        return this._logs;
    }
    async prepare() {
        this._nextUnique = await this._connection.prepare(this._transaction, `SELECT NEXT VALUE FOR ${Prefix_1.Prefix.join(createDefaultGenerators_1.G_UNIQUE_DDL_NAME, Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR)} FROM RDB$DATABASE`);
    }
    async dispose() {
        if (this._nextUnique) {
            await this._nextUnique.dispose();
        }
    }
    async addSequence(sequenceName) {
        await this._connection.execute(this._transaction, `CREATE SEQUENCE ${sequenceName}`);
        await this._connection.execute(this._transaction, `ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
    }
    async addTable(tableName, scalarFields) {
        const fields = scalarFields.map((item) => `${item.name.padEnd(31)} ${item.domain}`);
        const sql = `CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
    }
    async addPrimaryKey(tableName, fieldNames) {
        const sql = `ALTER TABLE ${tableName} ADD CONSTRAINT ${Prefix_1.Prefix.join(tableName, Prefix_1.Prefix.PK)} PRIMARY KEY (${fieldNames.join(", ")})`;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
    }
    async addScalarDomain(domainName, options) {
        const sql = `CREATE DOMAIN ${domainName} AS ${options.type}`.padEnd(62) +
            options.default.padEnd(40) +
            options.nullable.padEnd(10) +
            options.check.padEnd(62);
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
    }
    async nextUnique() {
        if (this._nextUnique) {
            const result = await this._nextUnique.executeReturning();
            return (await result.getAll())[0];
        }
        else {
            throw new Error("nextUnique is undefined");
        }
    }
}
exports.DDLHelper = DDLHelper;
//# sourceMappingURL=DDLHelper.js.map