"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Prefix_1 = require("../Prefix");
const Update1_1 = require("../updates/Update1");
const DDLUniqueGenerator_1 = require("./DDLUniqueGenerator");
class DDLHelper {
    constructor(connection, transaction) {
        this._ddlUniqueGen = new DDLUniqueGenerator_1.DDLUniqueGenerator();
        this._logs = [];
        this._connection = connection;
        this._transaction = transaction;
    }
    get logs() {
        return this._logs;
    }
    static _getColumnProps(props) {
        return ((props.default ? `DEFAULT ${props.default}` : " ").padEnd(40) +
            (props.notNull ? "NOT NULL" : " ").padEnd(10) +
            (props.check || "").padEnd(62));
    }
    async prepare() {
        await this._ddlUniqueGen.prepare(this._connection, this._transaction);
    }
    async dispose() {
        await this._ddlUniqueGen.dispose();
    }
    async addSequence(sequenceName) {
        await this._connection.execute(this._transaction, `CREATE SEQUENCE ${sequenceName}`);
        await this._connection.execute(this._transaction, `ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
    }
    async addTable(tableName, scalarFields) {
        const fields = scalarFields.map((item) => (`${item.name.padEnd(31)} ${item.domain.padEnd(31)} ${DDLHelper._getColumnProps(item)}`.trim()));
        const sql = `CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
    }
    async addColumns(tableName, scalarFields) {
        for (const field of scalarFields) {
            const column = field.name.padEnd(31) + " " + field.domain.padEnd(31);
            const sql = `ALTER TABLE ${tableName} ADD ${column} ${DDLHelper._getColumnProps(field)}`.trim();
            this._logs.push(sql);
            await this._connection.execute(this._transaction, sql);
        }
    }
    async addPrimaryKey(constraintName, tableName, fieldNames) {
        if (!fieldNames) {
            fieldNames = tableName;
            tableName = constraintName;
            constraintName = undefined;
        }
        if (!constraintName) {
            constraintName = Prefix_1.Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix_1.Prefix.PRIMARY_KEY);
        }
        const sql = `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} PRIMARY KEY (${fieldNames.join(", ")})`;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
        return constraintName;
    }
    async addForeignKey(constraintName, from, to) {
        if (!to) {
            to = from;
            from = constraintName;
            constraintName = undefined;
        }
        if (!constraintName) {
            constraintName = Prefix_1.Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix_1.Prefix.FOREIGN_KEY);
        }
        const sql = `ALTER TABLE ${from.tableName} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${from.fieldName}) ` +
            `REFERENCES ${to.tableName} (${to.fieldName})`;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
        return constraintName;
    }
    async addDomain(domainName, props) {
        if (!props) {
            props = domainName;
            domainName = undefined;
        }
        if (!domainName) {
            domainName = Prefix_1.Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix_1.Prefix.DOMAIN);
        }
        const sql = `CREATE DOMAIN ${domainName.padEnd(31)} AS ${props.type.padEnd(31)}` +
            DDLHelper._getColumnProps(props);
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
        return domainName;
    }
    async addAutoIncrementTrigger(triggerName, tableName, fieldName) {
        if (!fieldName) {
            fieldName = tableName;
            tableName = triggerName;
            triggerName = undefined;
        }
        if (!triggerName) {
            triggerName = Prefix_1.Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix_1.Prefix.TRIGGER_BI);
        }
        const sql = `
      CREATE TRIGGER ${triggerName} FOR ${tableName}
        ACTIVE BEFORE INSERT POSITION 0
      AS
      BEGIN
        IF (NEW.${fieldName} IS NULL) THEN NEW.${fieldName} = NEXT VALUE FOR ${Update1_1.GLOBAL_GENERATOR};
      END
    `;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
    }
}
exports.DDLHelper = DDLHelper;
//# sourceMappingURL=DDLHelper.js.map