import { AConnection, ATransaction, DeleteRule, UpdateRule } from "gdmn-db";
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
export interface IFKOptions {
    onUpdate: UpdateRule;
    onDelete: DeleteRule;
}
export declare type Sorting = "ASC" | "DESC";
export declare class DDLHelper {
    static DEFAULT_FK_OPTIONS: IFKOptions;
    private readonly _connection;
    private readonly _transaction;
    private _ddlUniqueGen;
    private _logs;
    constructor(connection: AConnection, transaction: ATransaction);
    readonly connection: AConnection;
    readonly transaction: ATransaction;
    readonly logs: string[];
    readonly prepared: boolean;
    private static _getConstraint;
    private static _getColumnProps;
    prepare(): Promise<void>;
    dispose(): Promise<void>;
    addSequence(sequenceName: string): Promise<void>;
    addTable(scalarFields: IFieldProps[]): Promise<string>;
    addTable(tableName: string, scalarFields: IFieldProps[]): Promise<string>;
    addTableCheck(tableName: string, checks: string[]): Promise<void>;
    addTableCheck(constraintName: string, tableName: string, checks: string[]): Promise<void>;
    addColumns(tableName: string, fields: IFieldProps[]): Promise<void>;
    createIndex(tableName: string, type: Sorting, fieldNames: string[]): Promise<string>;
    createIndex(indexName: string, tableName: string, type: Sorting, fieldNames: string[]): Promise<string>;
    addUnique(tableName: string, fieldNames: string[]): Promise<string>;
    addUnique(constraintName: string, tableName: string, fieldNames: string[]): Promise<string>;
    addPrimaryKey(tableName: string, fieldNames: string[]): Promise<string>;
    addPrimaryKey(constraintName: string, tableName: string, fieldNames: string[]): Promise<string>;
    addForeignKey(options: IFKOptions, from: IRelation, to: IRelation): Promise<string>;
    addForeignKey(constraintName: string, options: IFKOptions, from: IRelation, to: IRelation): Promise<string>;
    addDomain(props: IDomainProps): Promise<string>;
    addDomain(domainName: string, props: IDomainProps): Promise<string>;
    addAutoIncrementTrigger(tableName: string, fieldName: string, sequenceName: string): Promise<string>;
    addAutoIncrementTrigger(triggerName: string, tableName: string, fieldName: string, sequenceName: string): Promise<string>;
    private _loggedExecute;
}
//# sourceMappingURL=DDLHelper.d.ts.map