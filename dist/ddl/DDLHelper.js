"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Prefix_1 = require("../Prefix");
class DDLHelper {
    constructor(connection, transaction) {
        this._logs = [];
        this._connection = connection;
        this._transaction = transaction;
    }
    get logs() {
        return this._logs;
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
        const sql = `CREATE DOMAIN ${domainName.padEnd(31)} AS ${options.type.padEnd(31)}` +
            (options.default ? `DEFAULT ${options.default}` : "").padEnd(40) +
            (options.notNull ? "NOT NULL" : "").padEnd(10) +
            (options.check || "").padEnd(62);
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
    }
}
exports.DDLHelper = DDLHelper;
//# sourceMappingURL=DDLHelper.js.map