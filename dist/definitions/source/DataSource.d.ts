import { AConnection } from "gdmn-db";
import { EntityQuery, ERModel, IDataSource, IQueryResponse, ISequenceSource, Sequence } from "gdmn-orm";
import { EntitySource } from "./EntitySource";
import { Transaction } from "./Transaction";
export declare class DataSource implements IDataSource {
    private readonly _connection;
    private _dbStructure;
    private _globalSequence;
    constructor(connection: AConnection);
    readonly globalSequence: Sequence;
    init(obj: ERModel): Promise<ERModel>;
    startTransaction(): Promise<Transaction>;
    query(query: EntityQuery, transaction?: Transaction): Promise<IQueryResponse>;
    getEntitySource(): EntitySource;
    getSequenceSource(): ISequenceSource;
    withTransaction<R>(transaction: Transaction | undefined, callback: (transaction: Transaction) => Promise<R>): Promise<R>;
}
//# sourceMappingURL=DataSource.d.ts.map