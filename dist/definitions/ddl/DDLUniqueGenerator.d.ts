import { AConnection, ATransaction } from "gdmn-db";
export declare class DDLUniqueGenerator {
    private _nextUnique;
    prepare(connection: AConnection, transaction: ATransaction): Promise<void>;
    dispose(): Promise<void>;
    next(): Promise<number>;
    private getNextUnique;
}
