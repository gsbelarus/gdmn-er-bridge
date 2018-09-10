import {AConnection, ATransaction} from "gdmn-db";
import {TExecutor} from "gdmn-db/src/types";

export abstract class BaseUpdate {

  protected abstract _version: number;
  protected abstract _description: string;

  protected _connection: AConnection;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  get version(): number {
    return this._version;
  }

  get description(): string {
    return `(-> v${this._version}) ${this._description}`;
  }

  public abstract run(): Promise<void>;

  protected async _executeTransaction<R>(callback: TExecutor<ATransaction, R>): Promise<R> {
    return await AConnection.executeTransaction({
      connection: this._connection,
      callback: callback
    });
  }

  protected async _updateDatabaseVersion(transaction: ATransaction): Promise<void> {
    await this._connection.execute(transaction, `
      UPDATE OR INSERT INTO AT_DATABASE (ID, VERSION)
      VALUES (1, :version)
      MATCHING (ID)
    `, {
      version: this._version
    });
  }
}
