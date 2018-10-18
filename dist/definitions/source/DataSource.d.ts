import { AConnection, DBStructure } from "gdmn-db";
import { EntityQuery, ERModel, IDataSource, IQueryResponse, ISequenceSource } from "gdmn-orm";
import { EntitySource } from "./EntitySource";
import { Transaction } from "./Transaction";
export declare class DataSource implements IDataSource {
    private readonly _connection;
    private readonly _dbStructure;
    private _globalSequence;
    constructor(connection: AConnection, dbStructure: DBStructure);
    init(obj: ERModel): Promise<ERModel>;
    startTransaction(): Promise<Transaction>;
    query(transaction: Transaction, query: EntityQuery): Promise<IQueryResponse>;
    getEntitySource(): EntitySource;
    getSequenceSource(): ISequenceSource;
}
