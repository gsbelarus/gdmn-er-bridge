import {DDLHelper} from "../ddl/DDLHelper";
import {Prefix} from "../Prefix";
import {BaseUpdate} from "./BaseUpdate";

export const GLOBAL_GENERATOR = Prefix.join("UNIQUE", Prefix.GDMN, Prefix.GENERATOR);

// Update for creating gedemin database
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

      await ddlHelper.addTable("AT_FIELDS", [
        {name: "ID", domain: "DINTKEY"},
        {name: "FIELDNAME", domain: "DFIELDNAME", notNull: true},
        {name: "LNAME", domain: "DNAME"},
        {name: "DESCRIPTION", domain: "DTEXT180"},
        {name: "REFTABLE", domain: "DTABLENAME"},
        {name: "REFCONDITION", domain: "DTEXT255"},
        {name: "SETTABLE", domain: "DTABLENAME"},
        {name: "SETLISTFIELD", domain: "DFIELDNAME"},
        {name: "SETCONDITION", domain: "DTEXT255"},
        {name: "NUMERATION", domain: "DNUMERATIONBLOB"}
      ]);
      await ddlHelper.addPrimaryKey("AT_FIELDS", ["ID"]);
      await ddlHelper.addAutoIncrementTrigger("AT_BI_FIELDS", "AT_FIELDS", "ID");

      await ddlHelper.addTable("AT_RELATIONS", [
        {name: "ID", domain: "DINTKEY"},
        {name: "RELATIONNAME", domain: "DTABLENAME", notNull: true},
        {name: "LNAME", domain: "DNAME"},
        {name: "DESCRIPTION", domain: "DTEXT180"},
        {name: "SEMCATEGORY", domain: "DTEXT60"}
      ]);
      await ddlHelper.addPrimaryKey("AT_RELATIONS", ["ID"]);
      await ddlHelper.addAutoIncrementTrigger("AT_BI_RELATIONS", "AT_RELATIONS", "ID");

      await ddlHelper.addTable("AT_RELATION_FIELDS", [
        {name: "ID", domain: "DINTKEY"},
        {name: "FIELDNAME", domain: "DFIELDNAME", notNull: true},
        {name: "RELATIONNAME", domain: "DTABLENAME", notNull: true},
        {name: "FIELDSOURCE", domain: "DFIELDNAME"},
        {name: "LNAME", domain: "DNAME"},
        {name: "DESCRIPTION", domain: "DTEXT180"},
        {name: "SEMCATEGORY", domain: "DTEXT60"},
        {name: "CROSSTABLE", domain: "DTABLENAME"},
        {name: "CROSSFIELD", domain: "DFIELDNAME"}
      ]);
      await ddlHelper.addPrimaryKey("AT_RELATION_FIELDS", ["ID"]);
      await ddlHelper.addAutoIncrementTrigger("AT_BI_RELATION_FIELDS", "AT_RELATION_FIELDS", "ID");

      await ddlHelper.addTable("GD_DOCUMENTTYPE", [
        {name: "ID", domain: "DINTKEY"},
        {name: "RUID", domain: "DRUID"},
        {name: "DOCUMENTTYPE", domain: "DDOCUMENTTYPE", default: "'D'"},
        {name: "NAME", domain: "DNAME"},
        {name: "CLASSNAME", domain: "DCLASSNAME"},
        {name: "PARENT", domain: "DPARENT"},
        {name: "LB", domain: "DLB"},
        {name: "RB", domain: "DRB"},
        {name: "HEADERRELKEY", domain: "DFOREIGNKEY"},
        {name: "LINERELKEY", domain: "DFOREIGNKEY"}
      ]);
      await ddlHelper.addPrimaryKey("GD_DOCUMENTTYPE", ["ID"]);
      await ddlHelper.addAutoIncrementTrigger("GD_BI_DOCUMENTTYPE", "GD_DOCUMENTTYPE", "ID");
    });
  }
}
