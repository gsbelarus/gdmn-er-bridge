import { AConnection, ATransaction } from "gdmn-db";
import { TExecutor } from "gdmn-db/src/types";
export declare abstract class BaseUpdate {
    abstract version: number;
    protected _connection: AConnection;
    constructor(connection: AConnection);
    abstract run(): Promise<void>;
    protected _executeTransaction<R>(callback: TExecutor<ATransaction, R>): Promise<R>;
    protected _updateDatabaseVersion(transaction: ATransaction): Promise<void>;
}
