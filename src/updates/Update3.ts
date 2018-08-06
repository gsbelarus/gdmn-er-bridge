import {DDLHelper} from "../ddl/DDLHelper";
import {BaseUpdate} from "./BaseUpdate";

export class Update3 extends BaseUpdate {

  public version: number = 3;

  public async do(): Promise<void> {
    await this._executeTransaction(async (transaction) => {
      const ddlHelper = new DDLHelper(this._connection, transaction);

      await ddlHelper.prepare();
      try {
        await ddlHelper.addColumns("AT_RELATION_FIELDS", [
          {name: "MASTERENTITYNAME", domain: "DTABLENAME"}
        ]);
      } finally {
        await ddlHelper.dispose();
      }
    });
  }
}
