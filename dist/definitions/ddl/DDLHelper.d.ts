import { AConnection, ATransaction } from "gdmn-db";
export interface IColumnsProps {
    notNull?: boolean;
    default?: string;
    check?: string;
}
export interface IScalarFieldProps extends IColumnsProps {
    name: string;
    domain: string;
}
export interface IDomainProps extends IColumnsProps {
    type: string;
}
export declare class DDLHelper {
    private readonly _connection;
    private readonly _transaction;
    private _ddlUniqueGen;
    private _logs;
    constructor(connection: AConnection, transaction: ATransaction);
    readonly logs: string[];
    private static _getColumnProps;
    prepare(): Promise<void>;
    dispose(): Promise<void>;
    addSequence(sequenceName: string): Promise<void>;
    addTable(tableName: string, scalarFields: IScalarFieldProps[]): Promise<void>;
    addScalarColumns(tableName: string, scalarFields: IScalarFieldProps[]): Promise<void>;
    addPrimaryKey(tableName: string, fieldNames: string[]): Promise<string>;
    addScalarDomain(props: IDomainProps): Promise<string>;
    addScalarDomain(domainName: string, pros: IDomainProps): Promise<string>;
    addAutoIncrementTrigger(triggerName: string, tableName: string, fieldName: string): Promise<void>;
}
