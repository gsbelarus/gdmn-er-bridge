"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DDLHelper_1 = require("../ddl/DDLHelper");
const Prefix_1 = require("../Prefix");
const BaseUpdate_1 = require("./BaseUpdate");
exports.GLOBAL_GENERATOR = Prefix_1.Prefix.join("UNIQUE", Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR);
class Update1 extends BaseUpdate_1.BaseUpdate {
    constructor() {
        super(...arguments);
        this.version = 1;
    }
    async do() {
        await this._executeTransaction(async (transaction) => {
            const ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
            await ddlHelper.addSequence(exports.GLOBAL_GENERATOR);
            await ddlHelper.addScalarDomain("DINTKEY", { type: "INTEGER", notNull: true, check: "CHECK (VALUE > 0)" });
            await ddlHelper.addScalarDomain("DPARENT", { type: "INTEGER" });
            await ddlHelper.addScalarDomain("DFOREIGNKEY", { type: "INTEGER" });
            await ddlHelper.addScalarDomain("DLB", { type: "INTEGER", default: "1", notNull: true });
            await ddlHelper.addScalarDomain("DRB", { type: "INTEGER", default: "2", notNull: true });
            await ddlHelper.addScalarDomain("DRUID", { type: "VARCHAR(21)", notNull: true });
            await ddlHelper.addScalarDomain("DBOOLEAN", { type: "SMALLINT", default: "0", check: "CHECK (VALUE IN (0, 1))" });
            await ddlHelper.addScalarDomain("DTABLENAME", { type: "VARCHAR(31)", check: "CHECK (VALUE > '')" });
            await ddlHelper.addScalarDomain("DFIELDNAME", { type: "VARCHAR(31)", check: "CHECK (VALUE > '')" });
            await ddlHelper.addScalarDomain("DTEXT255", { type: "VARCHAR(255)" });
            await ddlHelper.addScalarDomain("DTEXT180", { type: "VARCHAR(180)" });
            await ddlHelper.addScalarDomain("DTEXT60", { type: "VARCHAR(60)" });
            await ddlHelper.addScalarDomain("DNAME", { type: "VARCHAR(60)", notNull: true });
            await ddlHelper.addScalarDomain("DDOCUMENTTYPE", {
                type: "VARCHAR(1)",
                check: " CHECK ((VALUE = 'B') OR (VALUE = 'D'))"
            });
            await ddlHelper.addScalarDomain("DCLASSNAME", { type: "VARCHAR(40)" });
            await ddlHelper.addScalarDomain("DNUMERATIONBLOB", { type: "BLOB SUB_TYPE -1 SEGMENT SIZE 256" });
            await this._connection.execute(transaction, `
        CREATE TABLE AT_FIELDS (
          ID                  DINTKEY                                 PRIMARY KEY,
          FIELDNAME           DFIELDNAME          NOT NULL,
          LNAME               DNAME,
          DESCRIPTION         DTEXT180,
          REFTABLE            DTABLENAME,
          REFCONDITION        DTEXT255,
          SETTABLE            DTABLENAME,
          SETLISTFIELD        DFIELDNAME,
          SETCONDITION        DTEXT255,
          NUMERATION          DNUMERATIONBLOB
        )
      `);
            await this.createAutoIncrementTrigger(transaction, "AT_FIELDS", "AT_BI_FIELDS");
            await this._connection.execute(transaction, `
        CREATE TABLE AT_RELATIONS (
          ID                  DINTKEY                                 PRIMARY KEY,
          RELATIONNAME        DTABLENAME          NOT NULL,
          LNAME               DNAME,
          DESCRIPTION         DTEXT180,
          SEMCATEGORY         DTEXT60
        )
      `);
            await this.createAutoIncrementTrigger(transaction, "AT_RELATIONS", "AT_BI_RELATIONS");
            await this._connection.execute(transaction, `
        CREATE TABLE AT_RELATION_FIELDS (
          ID                  DINTKEY                                 PRIMARY KEY,
          FIELDNAME           DFIELDNAME          NOT NULL,
          RELATIONNAME        DTABLENAME          NOT NULL,
          FIELDSOURCE         DFIELDNAME,
          LNAME               DNAME,
          DESCRIPTION         DTEXT180,
          SEMCATEGORY         DTEXT60,
          CROSSTABLE          DTABLENAME,
          CROSSFIELD          DFIELDNAME
        )
      `);
            await this.createAutoIncrementTrigger(transaction, "AT_RELATION_FIELDS", "AT_BI_RELATION_FIELDS");
            await this._connection.execute(transaction, `
        CREATE TABLE GD_DOCUMENTTYPE (
          ID                  DINTKEY                                 PRIMARY KEY,
          RUID                DRUID,
          DOCUMENTTYPE        DDOCUMENTTYPE       DEFAULT 'D',
          NAME                DNAME,
          CLASSNAME           DCLASSNAME,
          PARENT              DPARENT,
          LB                  DLB,
          RB                  DRB,
          HEADERRELKEY        DFOREIGNKEY,
          LINERELKEY          DFOREIGNKEY
        )
      `);
            await this.createAutoIncrementTrigger(transaction, "GD_DOCUMENTTYPE", "GD_BI_DOCUMENTTYPE");
            await this._connection.execute(transaction, `
        CREATE TABLE AT_DATABASE (
          ID                  DINTKEY,
          VERSION             DINTKEY
        )
      `);
        });
    }
    async createAutoIncrementTrigger(transaction, relation, name) {
        await this._connection.execute(transaction, `
      CREATE TRIGGER ${name} FOR ${relation}
        ACTIVE BEFORE INSERT POSITION 0
      AS
      BEGIN
        IF (NEW.ID IS NULL) THEN NEW.ID = NEXT VALUE FOR ${exports.GLOBAL_GENERATOR};
      END
    `);
    }
}
exports.Update1 = Update1;
//# sourceMappingURL=Update1.js.map