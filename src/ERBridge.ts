import {AConnection, ATransaction, DBStructure} from "gdmn-db";
import {ERModel} from "gdmn-orm";
import {erExport} from "./export/erexport";
import {ERImport} from "./import/ERImport";

export class ERBridge {

  private readonly _connection: AConnection;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  public async exportFromDatabase(dbStructure: DBStructure,
                                  transaction: ATransaction,
                                  erModel: ERModel = new ERModel()): Promise<ERModel> {
    return await erExport(dbStructure, this._connection, transaction, erModel);
  }

  public async importToDatabase(erModel: ERModel): Promise<void> {
    return await new ERImport(this._connection, erModel).execute();
  }
}
