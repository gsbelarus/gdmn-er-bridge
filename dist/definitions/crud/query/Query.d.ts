import { AConnection, DBStructure } from "gdmn-db";
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
export declare abstract class Query {
    static execute(connection: AConnection, erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse>;
}
