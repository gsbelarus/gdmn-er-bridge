"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const moment_1 = __importDefault(require("moment"));
const Constants_1 = require("../Constants");
class DomainResolver {
    static resolve(attr) {
        return {
            type: DomainResolver._getType(attr),
            default: DomainResolver._getDefaultValue(attr),
            notNull: attr.required,
            check: DomainResolver._getChecker(attr)
        };
    }
    static _getType(attr) {
        let expr = "";
        // TODO TimeIntervalAttribute
        if (gdmn_orm_1.SetAttribute.isType(attr)) {
            expr = `VARCHAR(${attr.presLen})`;
        }
        else if (gdmn_orm_1.EntityAttribute.isType(attr)) {
            expr = `INTEGER`;
        }
        else if (gdmn_orm_1.EnumAttribute.isType(attr)) {
            expr = `VARCHAR(1)`;
        }
        else if (gdmn_orm_1.DateAttribute.isType(attr)) {
            expr = `DATE`;
        }
        else if (gdmn_orm_1.TimeAttribute.isType(attr)) {
            expr = `TIME`;
        }
        else if (gdmn_orm_1.TimeStampAttribute.isType(attr)) {
            expr = `TIMESTAMP`;
        }
        else if (gdmn_orm_1.SequenceAttribute.isType(attr)) {
            expr = `INTEGER`;
        }
        else if (gdmn_orm_1.IntegerAttribute.isType(attr)) {
            expr = DomainResolver._getIntTypeByRange(attr.minValue, attr.maxValue);
        }
        else if (gdmn_orm_1.NumericAttribute.isType(attr)) {
            expr = `NUMERIC(${attr.precision}, ${attr.scale})`;
        }
        else if (gdmn_orm_1.FloatAttribute.isType(attr)) {
            expr = `FLOAT`;
        }
        else if (gdmn_orm_1.BooleanAttribute.isType(attr)) {
            expr = `SMALLINT`;
        }
        else if (gdmn_orm_1.StringAttribute.isType(attr)) {
            expr = `VARCHAR(${attr.maxLength})`;
        }
        else if (gdmn_orm_1.BlobAttribute.isType(attr)) {
            expr = `BLOB`;
        }
        else {
            expr = `BLOB SUB_TYPE TEXT`;
        }
        return expr;
    }
    static _getChecker(attr) {
        let expr = "";
        if (gdmn_orm_1.NumberAttribute.isType(attr)) {
            const minCond = attr.minValue !== undefined ? DomainResolver._val2Str(attr, attr.minValue) : undefined;
            const maxCond = attr.maxValue !== undefined ? DomainResolver._val2Str(attr, attr.maxValue) : undefined;
            if (minCond && maxCond) {
                expr = `CHECK(VALUE BETWEEN ${minCond} AND ${maxCond})`;
            }
            else if (minCond) {
                expr = `CHECK(VALUE >= ${minCond})`;
            }
            else if (maxCond) {
                expr = `CHECK(VALUE <= ${maxCond})`;
            }
        }
        else if (gdmn_orm_1.StringAttribute.isType(attr)) {
            const minCond = attr.minLength !== undefined ? `CHAR_LENGTH(VALUE) >= ${attr.minLength}` : undefined;
            if (minCond) {
                expr = `CHECK(${minCond})`;
            }
        }
        else if (gdmn_orm_1.EnumAttribute.isType(attr)) {
            expr = `CHECK(VALUE IN (${attr.values.map((item) => `'${item.value}'`).join(", ")}))`;
        }
        else if (gdmn_orm_1.BooleanAttribute.isType(attr)) {
            expr = `CHECK(VALUE IN (0, 1))`;
        }
        return expr;
    }
    static _getDefaultValue(attr) {
        let expr = "";
        if (attr.defaultValue !== undefined) {
            expr = `${DomainResolver._val2Str(attr, attr.defaultValue)}`;
        }
        return expr;
    }
    static _val2Str(attr, value) {
        if (gdmn_orm_1.DateAttribute.isType(attr)) {
            return DomainResolver._date2Str(value);
        }
        else if (gdmn_orm_1.TimeAttribute.isType(attr)) {
            return DomainResolver._time2Str(value);
        }
        else if (gdmn_orm_1.TimeStampAttribute.isType(attr)) {
            return DomainResolver._dateTime2Str(value);
        }
        else if (gdmn_orm_1.NumberAttribute.isType(attr)) {
            return `${value}`;
        }
        else if (gdmn_orm_1.StringAttribute.isType(attr)) {
            return `'${value}'`;
        }
        else if (gdmn_orm_1.BooleanAttribute.isType(attr)) {
            return `${+value}`;
        }
        else if (gdmn_orm_1.EnumAttribute.isType(attr)) {
            return `'${value}'`;
        }
    }
    static _getIntTypeByRange(min = gdmn_orm_1.MIN_32BIT_INT, max = gdmn_orm_1.MAX_32BIT_INT) {
        const minR = [gdmn_orm_1.MIN_16BIT_INT, gdmn_orm_1.MIN_32BIT_INT, gdmn_orm_1.MIN_64BIT_INT];
        const maxR = [gdmn_orm_1.MAX_16BIT_INT, gdmn_orm_1.MAX_32BIT_INT, gdmn_orm_1.MAX_64BIT_INT];
        const start = minR.find((b) => b <= min);
        const end = maxR.find((b) => b >= max);
        if (start === undefined)
            throw new Error("Out of range");
        if (end === undefined)
            throw new Error("Out of range");
        switch (minR[Math.max(minR.indexOf(start), maxR.indexOf(end))]) {
            case gdmn_orm_1.MIN_64BIT_INT:
                return "BIGINT";
            case gdmn_orm_1.MIN_16BIT_INT:
                return "SMALLINT";
            case gdmn_orm_1.MIN_32BIT_INT:
            default:
                return "INTEGER";
        }
    }
    static _date2Str(date) {
        if (date instanceof Date) {
            return `'${moment_1.default(date).utc().format(Constants_1.Constants.DATE_TEMPLATE)}'`;
        }
        return date;
    }
    static _dateTime2Str(date) {
        if (date instanceof Date) {
            return `'${moment_1.default(date).utc().format(Constants_1.Constants.TIMESTAMP_TEMPLATE)}'`;
        }
        return date;
    }
    static _time2Str(date) {
        if (date instanceof Date) {
            return `'${moment_1.default(date).utc().format(Constants_1.Constants.TIME_TEMPLATE)}'`;
        }
        return date;
    }
}
exports.DomainResolver = DomainResolver;
//# sourceMappingURL=DomainResolver.js.map