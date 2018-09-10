import { AConnection, ATransaction } from "gdmn-db";
import { TExecutor } from "gdmn-db/src/types";
export declare abstract class BaseUpdate {
    protected abstract _version: number;
    protected abstract _description: string;
    protected _connection: AConnection;
    constructor(connection: AConnection);
    readonly version: number;
    readonly description: string;
    abstract run(): Promise<void>;
    protected _executeTransaction<R>(callback: TExecutor<ATransaction, R>): Promise<R>;
    protected _updateDatabaseVersion(transaction: ATransaction): Promise<void>;
}
