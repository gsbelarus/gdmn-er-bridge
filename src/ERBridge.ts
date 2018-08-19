import {AConnection, ATransaction, DBStructure, TExecutor} from "gdmn-db";
import {ERModel, IEntityQueryInspector} from "gdmn-orm";
import {Query} from "./crud/query/Query";
import {Builder} from "./ddl/builder/Builder";
import {EntityBuilder} from "./ddl/builder/EntityBuilder";
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

  public static getERModelBuilder(): ERModelBuilder {
    return new ERModelBuilder();
  }

  public static getEntityBuilder(): EntityBuilder {
    return new EntityBuilder();
  }

  public async executeEntityBuilder<R>(transaction: ATransaction, callback: TExecutor<EntityBuilder, R>): Promise<R> {
    return await Builder.executeSelf(this._connection, transaction, ERBridge.getEntityBuilder, callback);
  }

  public async executeERModelBuilder<R>(transaction: ATransaction, callback: TExecutor<ERModelBuilder, R>): Promise<R> {
    return await Builder.executeSelf(this._connection, transaction, ERBridge.getERModelBuilder, callback);
  }

  public async exportFromDatabase(dbStructure: DBStructure,
                                  transaction: ATransaction,
                                  erModel: ERModel = new ERModel()): Promise<ERModel> {
    return await new ERExport2(this._connection, transaction, dbStructure, erModel).execute();
    // return await erExport(dbStructure, this._connection, transaction, erModel);
  }

  public async initDatabase(): Promise<void> {
    await new UpdateManager().updateDatabase(this._connection);
  }

  public async query(erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse> {
    return await Query.execute(this._connection, erModel, dbStructure, query);
  }
}
