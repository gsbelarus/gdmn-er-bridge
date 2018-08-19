import {DDLHelper} from "../builder/DDLHelper";
import {BaseUpdate} from "./BaseUpdate";

export class Update5 extends BaseUpdate {

  public version: number = 5;

  public async run(): Promise<void> {
    await this._executeTransaction(async (transaction) => {
      const ddlHelper = new DDLHelper(this._connection, transaction);

      await ddlHelper.prepare();
      try {
        await ddlHelper.addColumns("AT_RELATION_FIELDS", [
          {name: "LBFIELDNAME", domain: "DFIELDNAME"},
          {name: "RBFIELDNAME", domain: "DFIELDNAME"}
        ]);
      } finally {
        await ddlHelper.dispose();
      }
      await this._updateDatabaseVersion(transaction);
    });
  }
}
