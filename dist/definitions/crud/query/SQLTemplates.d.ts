export declare abstract class SQLTemplates {
    static field(alias: string, fieldAlias: string, fieldName: string): string;
    static from(alias: string, tableName: string): string;
    static join(joinTableName: string, joinAlias: string, joinFieldName: string, alias: string, fieldName: string): string;
    static order(alias: string, fieldName: string, sort: string): string;
    static isNull(alias: string, fieldName: string): string;
    static condition(alias: string, fieldName: string, operator: string, value: string): string;
    static equals(alias: string, fieldName: string, value: string): string;
    static greater(alias: string, fieldName: string, value: string): string;
    static less(alias: string, fieldName: string, value: string): string;
}
//# sourceMappingURL=SQLTemplates.d.ts.map