import { AConnection, ATransaction, DBStructure, TExecutor } from "gdmn-db";
import { ERModel, IEntityQueryInspector } from "gdmn-orm";
import { EntityBuilder } from "./ddl/builder/EntityBuilder";
import { ERModelBuilder } from "./ddl/builder/ERModelBuilder";
export interface IQueryResponse {
    data: any[];
    aliases: Array<{
        alias: string;
        attribute: string;
        values: any;
    }>;
    sql: {
        query: string;
        params: {
            [field: string]: any;
        };
    };
}
export declare class ERBridge {
    private readonly _connection;
    constructor(connection: AConnection);
    static getERModelBuilder(): ERModelBuilder;
    static getEntityBuilder(): EntityBuilder;
    executeEntityBuilder<R>(transaction: ATransaction, callback: TExecutor<EntityBuilder, R>): Promise<R>;
    executeERModelBuilder<R>(transaction: ATransaction, callback: TExecutor<ERModelBuilder, R>): Promise<R>;
    exportFromDatabase(dbStructure: DBStructure, transaction: ATransaction, erModel?: ERModel): Promise<ERModel>;
    initDatabase(): Promise<void>;
    query(erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse>;
}
