import {ATransaction} from "gdmn-db";
import {DDLHelper} from "../ddl/DDLHelper";
import {Prefix} from "../Prefix";
import {BaseUpdate} from "./BaseUpdate";

export const GLOBAL_GENERATOR = Prefix.join("UNIQUE", Prefix.GDMN, Prefix.GENERATOR);

export class Update1 extends BaseUpdate {

  public version: number = 1;

  public async do(): Promise<void> {
    await this._executeTransaction(async (transaction) => {
      const ddlHelper = new DDLHelper(this._connection, transaction);

      await ddlHelper.addSequence(GLOBAL_GENERATOR);

      await ddlHelper.addScalarDomain("DINTKEY", {type: "INTEGER", notNull: true, check: "CHECK (VALUE > 0)"});
      await ddlHelper.addScalarDomain("DPARENT", {type: "INTEGER"});
      await ddlHelper.addScalarDomain("DFOREIGNKEY", {type: "INTEGER"});
      await ddlHelper.addScalarDomain("DLB", {type: "INTEGER", default: "1", notNull: true});
      await ddlHelper.addScalarDomain("DRB", {type: "INTEGER", default: "2", notNull: true});
      await ddlHelper.addScalarDomain("DRUID", {type: "VARCHAR(21)", notNull: true});
      await ddlHelper.addScalarDomain("DBOOLEAN", {type: "SMALLINT", default: "0", check: "CHECK (VALUE IN (0, 1))"});
      await ddlHelper.addScalarDomain("DTABLENAME", {type: "VARCHAR(31)", check: "CHECK (VALUE > '')"});
      await ddlHelper.addScalarDomain("DFIELDNAME", {type: "VARCHAR(31)", check: "CHECK (VALUE > '')"});
      await ddlHelper.addScalarDomain("DTEXT255", {type: "VARCHAR(255)"});
      await ddlHelper.addScalarDomain("DTEXT180", {type: "VARCHAR(180)"});
      await ddlHelper.addScalarDomain("DTEXT60", {type: "VARCHAR(60)"});
      await ddlHelper.addScalarDomain("DNAME", {type: "VARCHAR(60)", notNull: true});
      await ddlHelper.addScalarDomain("DDOCUMENTTYPE", {
        type: "VARCHAR(1)",
        check: " CHECK ((VALUE = 'B') OR (VALUE = 'D'))"
      });
      await ddlHelper.addScalarDomain("DCLASSNAME", {type: "VARCHAR(40)"});
      await ddlHelper.addScalarDomain("DNUMERATIONBLOB", {type: "BLOB SUB_TYPE -1 SEGMENT SIZE 256"});

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

  private async createAutoIncrementTrigger(transaction: ATransaction, relation: string, name: string) {
    await this._connection.execute(transaction, `
      CREATE TRIGGER ${name} FOR ${relation}
        ACTIVE BEFORE INSERT POSITION 0
      AS
      BEGIN
        IF (NEW.ID IS NULL) THEN NEW.ID = NEXT VALUE FOR ${GLOBAL_GENERATOR};
      END
    `);
  }
}
