import {DDLHelper} from "../ddl/DDLHelper";
import {Prefix} from "../Prefix";
import {BaseUpdate} from "./BaseUpdate";

export const GLOBAL_DDL_GENERATOR = Prefix.join("DDL", Prefix.GDMN, Prefix.GENERATOR);

export class Update2 extends BaseUpdate {

  public version: number = 2;

  public async do(): Promise<void> {
    await this._executeTransaction(async (transaction) => {
      const ddlHelper = new DDLHelper(this._connection, transaction);

      await ddlHelper.addSequence(GLOBAL_DDL_GENERATOR);

      await this._connection.execute(transaction, `
        ALTER TABLE AT_RELATION_FIELDS
          ADD ATTRNAME            DFIELDNAME
      `);
    });
  }
}
