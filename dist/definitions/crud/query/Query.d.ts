import { AConnection, DBStructure } from "gdmn-db";
import { ERModel, IEntityQueryInspector } from "gdmn-orm";
import { IQueryResponse } from "../../ERBridge";
export declare abstract class Query {
    static execute(connection: AConnection, erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse>;
}
//# sourceMappingURL=Query.d.ts.map