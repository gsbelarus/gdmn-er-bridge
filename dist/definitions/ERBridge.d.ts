import { AConnection, ATransaction, DBStructure } from "gdmn-db";
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
    exportFromDatabase(dbStructure: DBStructure, transaction: ATransaction, erModel?: ERModel): Promise<ERModel>;
    importToDatabase(erModel: ERModel): Promise<void>;
    getERModelBuilder(): Promise<ERModelBuilder>;
    getEntityBuilder(): Promise<EntityBuilder>;
    initDatabase(): Promise<void>;
    query(erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse>;
}
