import { AConnection } from "gdmn-db";
import { ERModel, IDataSource, ISequenceSource } from "gdmn-orm";
import { EntitySource } from "./EntitySource";
import { Transaction } from "./Transaction";
export declare class DataSource implements IDataSource {
    private readonly _connection;
    private _globalSequence;
    constructor(connection: AConnection);
    init(obj: ERModel): Promise<ERModel>;
    startTransaction(): Promise<Transaction>;
    getEntitySource(): EntitySource;
    getSequenceSource(): ISequenceSource;
}
