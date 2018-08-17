import {AConnection, ATransaction, DBStructure} from "gdmn-db";
import {ERModel, IEntityQueryInspector} from "gdmn-orm";
import {Query} from "./crud/query/Query";
import {EntityBuilder} from "./ddl/builder/EntityBuilder";
import {ERImport} from "./ddl/builder/ERImport";
import {ERModelBuilder} from "./ddl/builder/ERModelBuilder";
import {ERExport2} from "./ddl/export/ERExport2";
import {UpdateManager} from "./ddl/updates/UpdateManager";

export interface IQueryResponse {
  data: any[];
  aliases: Array<{ alias: string, attribute: string, values: any }>;
  sql: {
    query: string;
    params: { [field: string]: any };
  };
}

export class ERBridge {

  private readonly _connection: AConnection;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  public async exportFromDatabase(dbStructure: DBStructure,
                                  transaction: ATransaction,
                                  erModel: ERModel = new ERModel()): Promise<ERModel> {
    return await new ERExport2(this._connection, transaction, dbStructure, erModel).execute();
    // return await erExport(dbStructure, this._connection, transaction, erModel);
  }

  public async importToDatabase(erModel: ERModel): Promise<void> {
    return await new ERImport(this._connection, erModel).execute();
  }

  public async getERModelBuilder(): Promise<ERModelBuilder> {
    return new ERModelBuilder();
  }

  public async getEntityBuilder(): Promise<EntityBuilder> {
    return new EntityBuilder();
  }

  public async initDatabase(): Promise<void> {
    await new UpdateManager().updateDatabase(this._connection);
  }

  public async query(erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse> {
    return await Query.execute(this._connection, erModel, dbStructure, query);
  }
}
