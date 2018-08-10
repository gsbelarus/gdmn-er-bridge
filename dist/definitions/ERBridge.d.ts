import { AConnection, ATransaction, DBStructure } from "gdmn-db";
import { Entity, ERModel, IEntityQueryInspector } from "gdmn-orm";
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
    static completeERModel(erModel: ERModel): ERModel;
    static addEntityToERModel(erModel: ERModel, entity: Entity): Entity;
    exportFromDatabase(dbStructure: DBStructure, transaction: ATransaction, erModel?: ERModel): Promise<ERModel>;
    importToDatabase(erModel: ERModel): Promise<void>;
    initDatabase(): Promise<void>;
    query(erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse>;
}
