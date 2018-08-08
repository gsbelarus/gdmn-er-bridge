import { AConnection, ATransaction } from "gdmn-db";
import { DDLUniqueGenerator } from "./DDLUniqueGenerator";
export interface IColumnsProps {
    notNull?: boolean;
    default?: string;
    check?: string;
}
export interface IFieldProps extends IColumnsProps {
    name: string;
    domain: string;
}
export interface IDomainProps extends IColumnsProps {
    type: string;
}
export interface IRelation {
    tableName: string;
    fieldName: string;
}
export declare class DDLHelper {
    private readonly _connection;
    private readonly _transaction;
    private _ddlUniqueGen;
    private _logs;
    constructor(connection: AConnection, transaction: ATransaction);
    readonly logs: string[];
    readonly ddlUniqueGen: DDLUniqueGenerator;
    private static _getColumnProps;
    prepare(): Promise<void>;
    dispose(): Promise<void>;
    addSequence(sequenceName: string): Promise<void>;
    addTable(tableName: string, scalarFields: IFieldProps[]): Promise<void>;
    addColumns(tableName: string, scalarFields: IFieldProps[]): Promise<void>;
    addUnique(tableName: string, fieldNames: string[]): Promise<string>;
    addUnique(constraintName: string, tableName: string, fieldNames: string[]): Promise<string>;
    addPrimaryKey(tableName: string, fieldNames: string[]): Promise<string>;
    addPrimaryKey(constraintName: string, tableName: string, fieldNames: string[]): Promise<string>;
    addForeignKey(from: IRelation, to: IRelation): Promise<string>;
    addForeignKey(constraintName: string, from: IRelation, to: IRelation): Promise<string>;
    addDomain(props: IDomainProps): Promise<string>;
    addDomain(domainName: string, pros: IDomainProps): Promise<string>;
    addAutoIncrementTrigger(tableName: string, fieldName: string, sequenceName: string): Promise<void>;
    addAutoIncrementTrigger(triggerName: string, tableName: string, fieldName: string, sequenceName: string): Promise<void>;
}
