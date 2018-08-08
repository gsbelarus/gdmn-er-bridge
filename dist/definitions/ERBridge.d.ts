import { AConnection, ATransaction, DBStructure } from "gdmn-db";
import { Entity, ERModel } from "gdmn-orm";
export declare class ERBridge {
    private readonly _connection;
    constructor(connection: AConnection);
    static completeERModel(erModel: ERModel): ERModel;
    static addEntityToERModel(erModel: ERModel, entity: Entity): Entity;
    exportFromDatabase(dbStructure: DBStructure, transaction: ATransaction, erModel?: ERModel): Promise<ERModel>;
    importToDatabase(erModel: ERModel): Promise<void>;
    initDatabase(): Promise<void>;
}
