import {AConnection, ATransaction} from "gdmn-db";
import {TExecutor} from "gdmn-db/src/types";

export abstract class BaseUpdate {

  public abstract version: number;

  protected _connection: AConnection;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  public abstract do(): Promise<void>;

  protected async _executeTransaction<R>(callback: TExecutor<ATransaction, R>): Promise<R> {
    return await AConnection.executeTransaction({
      connection: this._connection,
      callback: callback
    });
  }
}
