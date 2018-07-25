import { AConnection, ATransaction } from "gdmn-db";
import { IDomainOptions } from "./import/DomainResolver";
export interface IScalarField {
    name: string;
    domain: string;
}
export declare class DDLHelper {
    private readonly _connection;
    private readonly _transaction;
    private _logs;
    constructor(connection: AConnection, transaction: ATransaction);
    readonly logs: string[];
    addSequence(sequenceName: string): Promise<void>;
    addTable(tableName: string, scalarFields: IScalarField[]): Promise<void>;
    addPrimaryKey(tableName: string, fieldNames: string[]): Promise<void>;
    addScalarDomain(domainName: string, options: IDomainOptions): Promise<void>;
}
