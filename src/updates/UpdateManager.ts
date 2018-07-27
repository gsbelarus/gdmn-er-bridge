import {AConnection, ATransaction} from "gdmn-db";
import {BaseUpdate} from "./BaseUpdate";
import {Update1} from "./Update1";
import {Update2} from "./Update2";

export type UpdateConstructor = new (connection: AConnection) => BaseUpdate;

export class UpdateManager {

  public CURRENT_DATABASE_VERSION = 2;

  private readonly _updatesConstructors: UpdateConstructor[] = [
    Update2,
    Update1
  ];

  public async updateDatabase(connection: AConnection): Promise<void> {
    const updates = this._updatesConstructors
      .map((UpdateConstructor) => new UpdateConstructor(connection));

    this.sort(updates);
    this.verifyAmount(updates);

    const version = await AConnection.executeTransaction({
      connection,
      callback: (transaction) => this._getDBVersion(connection, transaction)
    });

    for (const update of updates) {
      if (update.version > version) {
        await update.do();
      }
    }
    await AConnection.executeTransaction({
      connection,
      callback: (transaction) => this._updateDBVersion(connection, transaction)
    });
  }

  private sort(updates: BaseUpdate[]): void {
    updates.sort((a, b) => {
      if (a.version === b.version) throw new Error("Two identical versions of BaseUpdate");
      return a.version < b.version ? -1 : 1;
    });
  }

  private verifyAmount(updates: BaseUpdate[]): void {
    const lastVersion = updates.reduce((prev, cur) => {
      if (cur.version - prev !== 1) {
        throw new Error("missing update");
      }
      return cur.version;
    }, 0);
    if (lastVersion < this.CURRENT_DATABASE_VERSION) {
      throw new Error("missing update");
    }
    if (lastVersion > this.CURRENT_DATABASE_VERSION) {
      throw new Error("extra update");
    }
  }

  private async _getDBVersion(connection: AConnection, transaction: ATransaction): Promise<number> {
    const gdmnExists = await connection.executeReturning(transaction, `
        SELECT COUNT(1) 
        FROM RDB$RELATIONS
        WHERE RDB$RELATION_NAME = 'AT_FIELDS'
      `);
    if (gdmnExists.getBoolean("COUNT")) {
      const versionExists = await connection.executeReturning(transaction, `
        SELECT COUNT(1) 
        FROM RDB$RELATIONS
        WHERE RDB$RELATION_NAME = 'AT_DATABASE'
      `);
      if (versionExists.getBoolean("COUNT")) {
        const result = await connection.executeReturning(transaction, `
          SELECT FIRST 1
            VERSION
          FROM AT_DATABASE
        `);
        return await result.getNumber("VERSION");
      }
      return 1; // gdmn database
    }
    return 0; // clean database
  }

  private async _updateDBVersion(connection: AConnection, transaction: ATransaction): Promise<void> {
    await connection.execute(transaction, `
      UPDATE OR INSERT INTO AT_DATABASE (ID, VERSION)
      VALUES (1, :version)
      MATCHING (ID)
    `, {
      version: this.CURRENT_DATABASE_VERSION
    });
  }
}
