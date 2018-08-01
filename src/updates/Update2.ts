import {DDLHelper} from "../ddl/DDLHelper";
import {Prefix} from "../Prefix";
import {BaseUpdate} from "./BaseUpdate";

export const GLOBAL_DDL_GENERATOR = Prefix.join("DDL", Prefix.GDMN, Prefix.GENERATOR);

// Update for creating gdmn-back adapted database
export class Update2 extends BaseUpdate {

  public version: number = 2;

  public async do(): Promise<void> {
    await this._executeTransaction(async (transaction) => {
      const ddlHelper = new DDLHelper(this._connection, transaction);
      await ddlHelper.addSequence(GLOBAL_DDL_GENERATOR);

      await ddlHelper.prepare();
      try {
        await ddlHelper.addTable("AT_DATABASE", [
          {name: "ID", domain: "DINTKEY"},
          {name: "VERSION", domain: "DINTKEY"}
        ]);
        await ddlHelper.addPrimaryKey("AT_PK_DATABASE", "AT_DATABASE", ["ID"]);

        await ddlHelper.addColumns("AT_RELATION_FIELDS", [
          {name: "ATTRNAME", domain: "DFIELDNAME"}
        ]);
      } finally {
        await ddlHelper.dispose();
      }
    });
  }
}
