import { AConnection, ATransaction, TExecutor } from "gdmn-db";
export declare abstract class BaseUpdate {
    protected abstract readonly _version: number;
    protected abstract readonly _description: string;
    protected _connection: AConnection;
    constructor(connection: AConnection);
    readonly version: number;
    readonly description: string;
    abstract run(): Promise<void>;
    protected _executeTransaction<R>(callback: TExecutor<ATransaction, R>): Promise<R>;
    protected _updateDatabaseVersion(transaction: ATransaction): Promise<void>;
    protected _getDatabaseVersion(transaction: ATransaction): Promise<number>;
    private _isTableExists;
}
//# sourceMappingURL=BaseUpdate.d.ts.map