import { AConnection, ATransaction, DBStructure } from "gdmn-db";
import { ERModel, IEntityQueryInspector } from "gdmn-orm";
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
    query(erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse>;
}
//# sourceMappingURL=ERBridge.d.ts.map