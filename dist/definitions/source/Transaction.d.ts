import { AConnection, ATransaction } from "gdmn-db";
import { ITransaction } from "gdmn-orm";
import { ERModelBuilder } from "../ddl/builder/ERModelBuilder";
export declare class Transaction implements ITransaction {
    private readonly _connection;
    private readonly _transaction;
    private readonly _builder;
    constructor(connection: AConnection, transaction: ATransaction);
    readonly finished: boolean;
    getBuilder(): Promise<ERModelBuilder>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
