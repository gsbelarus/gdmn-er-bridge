"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Prefix_1 = require("../Prefix");
const DDLUniqueGenerator_1 = require("./DDLUniqueGenerator");
class DDLHelper {
    constructor(connection, transaction) {
        this._ddlUniqueGen = new DDLUniqueGenerator_1.DDLUniqueGenerator();
        this._logs = [];
        this._connection = connection;
        this._transaction = transaction;
    }
    get connection() {
        return this._connection;
    }
    get transaction() {
        return this._transaction;
    }
    get logs() {
        return this._logs;
    }
    get prepared() {
        return this._ddlUniqueGen.prepared;
    }
    static _getConstraint(constraintName) {
        return constraintName ? `CONSTRAINT ${constraintName}` : "";
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
        if (!scalarFields) {
            scalarFields = tableName;
            tableName = undefined;
        }
        if (!tableName) {
            tableName = Prefix_1.Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix_1.Prefix.TABLE);
        }
        const fields = scalarFields.map((item) => (`${item.name.padEnd(31)} ${item.domain.padEnd(31)} ${DDLHelper._getColumnProps(item)}`.trim()));
        const sql = `CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
        return tableName;
    }
    async addTableCheck(constraintName, tableName, checks) {
        if (!checks) {
            checks = tableName;
            tableName = constraintName;
            constraintName = undefined;
        }
        for (const check of checks) {
            const sql = `ALTER TABLE ${tableName} ADD ${DDLHelper._getConstraint(constraintName)} CHECK (${check})`;
            this._logs.push(sql);
            await this._connection.execute(this._transaction, sql);
        }
    }
    async addColumns(tableName, fields) {
        for (const field of fields) {
            const column = field.name.padEnd(31) + " " + field.domain.padEnd(31);
            const sql = `ALTER TABLE ${tableName} ADD ${column} ${DDLHelper._getColumnProps(field)}`.trim();
            this._logs.push(sql);
            await this._connection.execute(this._transaction, sql);
        }
    }
    async createIndex(indexName, tableName, type, fieldNames) {
        if (!fieldNames) {
            fieldNames = type;
            type = tableName;
            tableName = indexName;
            indexName = undefined;
        }
        if (!indexName) {
            indexName = Prefix_1.Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix_1.Prefix.INDEX);
        }
        const sql = `CREATE ${type} INDEX ${indexName} ON ${tableName} (${fieldNames.join(", ")})`;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
        return indexName;
    }
    async addUnique(constraintName, tableName, fieldNames) {
        if (!fieldNames) {
            fieldNames = tableName;
            tableName = constraintName;
            constraintName = undefined;
        }
        if (!constraintName) {
            constraintName = Prefix_1.Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix_1.Prefix.UNIQUE);
        }
        const f = fieldNames.join(", ");
        const sql = `ALTER TABLE ${tableName} ADD ${DDLHelper._getConstraint(constraintName)} UNIQUE (${f})`;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
        return constraintName;
    }
    async addPrimaryKey(constraintName, tableName, fieldNames) {
        if (!fieldNames) {
            fieldNames = tableName;
            tableName = constraintName;
            constraintName = undefined;
        }
        const pk = fieldNames.join(", ");
        const sql = `ALTER TABLE ${tableName} ADD ${DDLHelper._getConstraint(constraintName)} PRIMARY KEY (${pk})`;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
        return constraintName;
    }
    async addForeignKey(constraintName, options, from, to) {
        if (!to) {
            to = from;
            from = options;
            options = constraintName;
            constraintName = undefined;
        }
        const { tableName, fieldName } = from;
        const sql = `ALTER TABLE ${tableName} ADD ${DDLHelper._getConstraint(constraintName)} FOREIGN KEY (${fieldName}) ` +
            `REFERENCES ${to.tableName} (${to.fieldName}) ` +
            (options.onUpdate ? `ON UPDATE ${options.onUpdate} ` : "") +
            (options.onDelete ? `ON DELETE ${options.onDelete} ` : "");
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
    async addAutoIncrementTrigger(triggerName, tableName, fieldName, sequenceName) {
        if (!sequenceName) {
            sequenceName = fieldName;
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
        IF (NEW.${fieldName} IS NULL) THEN NEW.${fieldName} = NEXT VALUE FOR ${sequenceName};
      END
    `;
        this._logs.push(sql);
        await this._connection.execute(this._transaction, sql);
        return triggerName;
    }
}
DDLHelper.DEFAULT_FK_OPTIONS = {
    onUpdate: "NO ACTION",
    onDelete: "NO ACTION"
};
exports.DDLHelper = DDLHelper;
//# sourceMappingURL=DDLHelper.js.map