import { AConnection, ATransaction, DBStructure } from "gdmn-db";
import { ERModel } from "gdmn-orm";
export declare class ERBridge {
    private readonly _connection;
    constructor(connection: AConnection);
    exportFromDatabase(dbStructure: DBStructure, transaction: ATransaction, erModel?: ERModel): Promise<ERModel>;
    importToDatabase(erModel: ERModel): Promise<void>;
    init(): Promise<void>;
}
