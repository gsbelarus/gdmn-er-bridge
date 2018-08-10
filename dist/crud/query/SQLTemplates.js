"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SQLTemplates {
    static field(alias, fieldAlias, fieldName) {
        return `  ${alias && `${alias}.`}${fieldName} AS ${fieldAlias}`;
    }
    static from(alias, tableName) {
        return `FROM ${tableName} ${alias}`;
    }
    static join(joinTableName, joinAlias, joinFieldName, alias, fieldName) {
        return `  LEFT JOIN ${joinTableName} ${joinAlias} ON ` +
            SQLTemplates.equals(joinAlias, joinFieldName, `${alias && `${alias}.`}${fieldName}`);
    }
    static order(alias, fieldName, sort) {
        return `${alias && `${alias}.`}${fieldName} ${sort}`;
    }
    static isNull(alias, fieldName) {
        return `${alias && `${alias}.`}${fieldName} IS NULL`;
    }
    static condition(alias, fieldName, operator, value) {
        return `${alias && `${alias}.`}${fieldName} ${operator} ${value}`;
    }
    static equals(alias, fieldName, value) {
        return SQLTemplates.condition(alias, fieldName, "=", value);
    }
    static greater(alias, fieldName, value) {
        return SQLTemplates.condition(alias, fieldName, ">", value);
    }
    static less(alias, fieldName, value) {
        return SQLTemplates.condition(alias, fieldName, "<", value);
    }
}
exports.SQLTemplates = SQLTemplates;
//# sourceMappingURL=SQLTemplates.js.map