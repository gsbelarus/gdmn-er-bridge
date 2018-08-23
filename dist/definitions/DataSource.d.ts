import { AConnection } from "gdmn-db";
import { ERModel, IDataSource, ISequenceSource } from "gdmn-orm";
import { EntitySource } from "./EntitySource";
import { Transaction } from "./Transaction";
export declare class DataSource implements IDataSource {
    private readonly _connection;
    constructor(connection: AConnection);
    init(obj: ERModel): Promise<ERModel>;
    startTransaction(): Promise<Transaction>;
    commitTransaction(transaction: Transaction): Promise<void>;
    rollbackTransaction(transaction: Transaction): Promise<void>;
    getEntitySource(): EntitySource;
    getSequenceSource(): ISequenceSource;
}
