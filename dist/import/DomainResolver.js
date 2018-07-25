"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gdmn_orm_1 = require("gdmn-orm");
var util_1 = require("../util");
var DomainResolver = /** @class */ (function () {
    function DomainResolver() {
    }
    DomainResolver.resolveScalar = function (attr) {
        return {
            type: DomainResolver._getScalarType(attr),
            default: DomainResolver._getDefaultValue(attr),
            nullable: DomainResolver._getNullFlag(attr),
            check: DomainResolver._getScalarChecker(attr)
        };
    };
    DomainResolver._getScalarType = function (attr) {
        var expr = "";
        // TODO TimeIntervalAttribute
        if (gdmn_orm_1.isEnumAttribute(attr)) {
            expr = "VARCHAR(1)";
        }
        else if (gdmn_orm_1.isDateAttribute(attr)) {
            expr = "DATE";
        }
        else if (gdmn_orm_1.isTimeAttribute(attr)) {
            expr = "TIME";
        }
        else if (gdmn_orm_1.isTimeStampAttribute(attr)) {
            expr = "TIMESTAMP";
        }
        else if (gdmn_orm_1.isSequenceAttribute(attr)) {
            expr = "INTEGER";
        }
        else if (gdmn_orm_1.isIntegerAttribute(attr)) {
            expr = DomainResolver._getIntTypeByRange(attr.minValue, attr.maxValue);
        }
        else if (gdmn_orm_1.isNumericAttribute(attr)) {
            expr = "NUMERIC(" + attr.precision + ", " + attr.scale + ")";
        }
        else if (gdmn_orm_1.isFloatAttribute(attr)) {
            expr = "FLOAT";
        }
        else if (gdmn_orm_1.isBooleanAttribute(attr)) {
            expr = "SMALLINT";
        }
        else if (gdmn_orm_1.isStringAttribute(attr)) {
            expr = "VARCHAR(" + attr.maxLength + ")";
        }
        else if (gdmn_orm_1.isBlobAttribute(attr)) {
            expr = "BLOB";
        }
        else {
            expr = "BLOB SUB_TYPE TEXT";
        }
        return expr;
    };
    DomainResolver._getScalarChecker = function (attr) {
        var expr = "";
        if (gdmn_orm_1.isNumberAttribute(attr)) {
            var minCond = attr.minValue !== undefined ? DomainResolver._val2Str(attr, attr.minValue) : undefined;
            var maxCond = attr.maxValue !== undefined ? DomainResolver._val2Str(attr, attr.maxValue) : undefined;
            if (minCond && maxCond) {
                expr = "CHECK(VALUE BETWEEN " + minCond + " AND " + maxCond + ")";
            }
            else if (minCond) {
                expr = "CHECK(VALUE >= " + minCond + ")";
            }
            else if (maxCond) {
                expr = "CHECK(VALUE <= " + maxCond + ")";
            }
        }
        else if (gdmn_orm_1.isStringAttribute(attr)) {
            var minCond = attr.minLength !== undefined ? "CHAR_LENGTH(VALUE) >= " + attr.minLength : undefined;
            if (minCond) {
                expr = "CHECK(" + minCond + ")";
            }
        }
        else if (gdmn_orm_1.isEnumAttribute(attr)) {
            expr = "CHECK(VALUE IN (" + attr.values.map(function (item) { return "'" + item.value + "'"; }).join(", ") + "))";
        }
        else if (gdmn_orm_1.isBooleanAttribute(attr)) {
            expr = "CHECK(VALUE IN (0, 1))";
        }
        return expr;
    };
    DomainResolver._getNullFlag = function (attr) {
        var expr = "";
        if (attr.required) {
            expr = "NOT NULL";
        }
        return expr;
    };
    DomainResolver._getDefaultValue = function (attr) {
        var expr = "";
        if (attr.defaultValue !== undefined) {
            expr = "DEFAULT " + DomainResolver._val2Str(attr, attr.defaultValue);
        }
        return expr;
    };
    DomainResolver._val2Str = function (attr, value) {
        if (gdmn_orm_1.isDateAttribute(attr)) {
            return util_1.date2Str(value);
        }
        else if (gdmn_orm_1.isTimeAttribute(attr)) {
            return util_1.time2Str(value);
        }
        else if (gdmn_orm_1.isTimeStampAttribute(attr)) {
            return util_1.dateTime2Str(value);
        }
        else if (gdmn_orm_1.isNumberAttribute(attr)) {
            return "" + value;
        }
        else if (gdmn_orm_1.isStringAttribute(attr)) {
            return "'" + value + "'";
        }
        else if (gdmn_orm_1.isBooleanAttribute(attr)) {
            return "" + +value;
        }
        else if (gdmn_orm_1.isEnumAttribute(attr)) {
            return "'" + value + "'";
        }
    };
    DomainResolver._getIntTypeByRange = function (min, max) {
        if (min === void 0) { min = gdmn_orm_1.MIN_32BIT_INT; }
        if (max === void 0) { max = gdmn_orm_1.MAX_32BIT_INT; }
        var minR = [gdmn_orm_1.MIN_16BIT_INT, gdmn_orm_1.MIN_32BIT_INT, gdmn_orm_1.MIN_64BIT_INT];
        var maxR = [gdmn_orm_1.MAX_16BIT_INT, gdmn_orm_1.MAX_32BIT_INT, gdmn_orm_1.MAX_64BIT_INT];
        var start = minR.find(function (b) { return b <= min; });
        var end = maxR.find(function (b) { return b >= max; });
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
    };
    return DomainResolver;
}());
exports.DomainResolver = DomainResolver;
//# sourceMappingURL=DomainResolver.js.map