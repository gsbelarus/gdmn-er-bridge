import { AConnection, ATransaction, DBStructure } from "gdmn-db";
import { Entity, ERModel, IEntityQueryInspector } from "gdmn-orm";
import { IQueryResponse } from "./query/Query";
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
