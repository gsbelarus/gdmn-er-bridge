import {DDLHelper} from "../builder/DDLHelper";
import {BaseUpdate} from "./BaseUpdate";

export abstract class BaseSimpleUpdate extends BaseUpdate {

  public async run(): Promise<void> {
    await this._executeTransaction(async (transaction) => {
      const ddHelper = new DDLHelper(this._connection, transaction);
      try {
        await ddHelper.prepare();

        await this.internalRun(ddHelper);

      } finally {
        if (ddHelper.prepared) {
          await ddHelper.dispose();
        }
      }

      await this._updateDatabaseVersion(transaction);
    });
  }

  protected abstract internalRun(ddlHelper: DDLHelper): Promise<void>;
}
