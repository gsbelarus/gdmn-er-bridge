"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DDLHelper_1 = require("../builder/DDLHelper");
const Constants_1 = require("../Constants");
const BaseUpdate_1 = require("./BaseUpdate");
class Update1 extends BaseUpdate_1.BaseUpdate {
    constructor() {
        super(...arguments);
        this._version = 1;
        this._description = "Обновление для чистой базы данных";
    }
    async run() {
        await this._executeTransaction(async (transaction) => {
            const ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
            await ddlHelper.addSequence(Constants_1.Constants.GLOBAL_GENERATOR);
            await ddlHelper.addDomain("DINTKEY", { type: "INTEGER", notNull: true, check: "CHECK (VALUE > 0)" });
            await ddlHelper.addDomain("DPARENT", { type: "INTEGER" });
            await ddlHelper.addDomain("DFOREIGNKEY", { type: "INTEGER" });
            await ddlHelper.addDomain("DLB", { type: "INTEGER", default: "1", notNull: true });
            await ddlHelper.addDomain("DRB", { type: "INTEGER", default: "2", notNull: true });
            await ddlHelper.addDomain("DTIMESTAMP_NOTNULL", { type: "TIMESTAMP", notNull: true });
            await ddlHelper.addDomain("DBOOLEAN", { type: "SMALLINT", default: "0", check: "CHECK (VALUE IN (0, 1))" });
            await ddlHelper.addDomain("DTABLENAME", { type: "VARCHAR(31)", check: "CHECK (VALUE > '')" });
            await ddlHelper.addDomain("DFIELDNAME", { type: "VARCHAR(31)", check: "CHECK (VALUE > '')" });
            await ddlHelper.addDomain("DTEXT255", { type: "VARCHAR(255)" });
            await ddlHelper.addDomain("DTEXT180", { type: "VARCHAR(180)" });
            await ddlHelper.addDomain("DTEXT60", { type: "VARCHAR(60)" });
            await ddlHelper.addDomain("DNAME", { type: "VARCHAR(60)", notNull: true });
            await ddlHelper.addDomain("DRELATIONTYPE", { type: "VARCHAR(1)", check: "CHECK (VALUE IN ('T', 'V'))" });
            await ddlHelper.addDomain("DCLASSNAME", { type: "VARCHAR(40)" });
            await ddlHelper.addDomain("DNUMERATIONBLOB", { type: "BLOB SUB_TYPE -1 SEGMENT SIZE 256" });
            await ddlHelper.addTable("AT_FIELDS", [
                { name: "ID", domain: "DINTKEY" },
                { name: "FIELDNAME", domain: "DFIELDNAME", notNull: true },
                { name: "LNAME", domain: "DNAME" },
                { name: "DESCRIPTION", domain: "DTEXT180" },
                { name: "REFTABLE", domain: "DTABLENAME" },
                { name: "REFCONDITION", domain: "DTEXT255" },
                { name: "SETTABLE", domain: "DTABLENAME" },
                { name: "SETLISTFIELD", domain: "DFIELDNAME" },
                { name: "SETCONDITION", domain: "DTEXT255" },
                { name: "NUMERATION", domain: "DNUMERATIONBLOB" }
            ]);
            await ddlHelper.addPrimaryKey("AT_PK_FIELDS", "AT_FIELDS", ["ID"]);
            await ddlHelper.addAutoIncrementTrigger("AT_BI_FIELDS", "AT_FIELDS", "ID", Constants_1.Constants.GLOBAL_GENERATOR);
            await ddlHelper.addTable("AT_RELATIONS", [
                { name: "ID", domain: "DINTKEY" },
                { name: "RELATIONNAME", domain: "DTABLENAME", notNull: true },
                { name: "RELATIONTYPE", domain: "DRELATIONTYPE" },
                { name: "LNAME", domain: "DNAME" },
                { name: "DESCRIPTION", domain: "DTEXT180" },
                { name: "SEMCATEGORY", domain: "DTEXT60" }
            ]);
            await ddlHelper.addPrimaryKey("AT_PK_RELATIONS", "AT_RELATIONS", ["ID"]);
            await ddlHelper.addAutoIncrementTrigger("AT_BI_RELATIONS", "AT_RELATIONS", "ID", Constants_1.Constants.GLOBAL_GENERATOR);
            await ddlHelper.addTable("AT_RELATION_FIELDS", [
                { name: "ID", domain: "DINTKEY" },
                { name: "FIELDNAME", domain: "DFIELDNAME", notNull: true },
                { name: "RELATIONNAME", domain: "DTABLENAME", notNull: true },
                { name: "FIELDSOURCE", domain: "DFIELDNAME" },
                { name: "FIELDSOURCEKEY", domain: "DINTKEY" },
                { name: "LNAME", domain: "DNAME" },
                { name: "DESCRIPTION", domain: "DTEXT180" },
                { name: "SEMCATEGORY", domain: "DTEXT60" },
                { name: "CROSSTABLE", domain: "DTABLENAME" },
                { name: "CROSSTABLEKEY", domain: "DFOREIGNKEY" },
                { name: "CROSSFIELD", domain: "DFIELDNAME" }
            ]);
            await ddlHelper.addPrimaryKey("AT_PK_RELATION_FIELDS", "AT_RELATION_FIELDS", ["ID"]);
            await ddlHelper.addAutoIncrementTrigger("AT_BI_RELATION_FIELDS", "AT_RELATION_FIELDS", "ID", Constants_1.Constants.GLOBAL_GENERATOR);
            console.debug(ddlHelper.logs.join("\n"));
        });
    }
}
exports.Update1 = Update1;
//# sourceMappingURL=Update1.js.map