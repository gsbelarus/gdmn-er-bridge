import { ATransaction } from "gdmn-db";
import { ITransaction } from "gdmn-orm";
import { ERModelBuilder } from "./ddl/builder/ERModelBuilder";
export declare class Transaction implements ITransaction {
    private readonly _transaction;
    private readonly _builder;
    constructor(transaction: ATransaction);
    readonly finished: boolean;
    readonly builder: ERModelBuilder;
    readonly dbTransaction: ATransaction;
    commit(): Promise<void>;
    rollback(): Promise<void>;
}
