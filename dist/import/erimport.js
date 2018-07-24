"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var gdmn_db_1 = require("gdmn-db");
var gdmn_orm_1 = require("gdmn-orm");
var util_1 = require("../util");
var atdata_1 = require("./atdata");
var document_1 = require("./document");
var domains_1 = require("./domains");
function erImport(connection, erModel) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, gdmn_db_1.AConnection.executeTransaction({
                        connection: connection,
                        callback: function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, domains_1.createDomains(connection, transaction)];
                                    case 1:
                                        _a.sent();
                                        return [4 /*yield*/, atdata_1.createATStructure(connection, transaction)];
                                    case 2:
                                        _a.sent();
                                        return [4 /*yield*/, document_1.createDocStructure(connection, transaction)];
                                    case 3:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, gdmn_db_1.AConnection.executeTransaction({
                            connection: connection,
                            callback: function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                var _i, _a, sequence, sequenceName, atRelationsStatement, atFieldsStatement, atRelFieldsStatement, _b, _c, entity, params, tableName, fields, attrs, _d, attrs_1, attr, domainName, numeration, sql_1, sql, pk, pkSql;
                                return __generator(this, function (_e) {
                                    switch (_e.label) {
                                        case 0:
                                            _i = 0, _a = Object.values(erModel.sequencies);
                                            _e.label = 1;
                                        case 1:
                                            if (!(_i < _a.length)) return [3 /*break*/, 5];
                                            sequence = _a[_i];
                                            sequenceName = sequence.adapter ? sequence.adapter.sequence : sequence.name;
                                            if (!(sequenceName !== "GD_G_UNIQUE")) return [3 /*break*/, 4];
                                            return [4 /*yield*/, connection.execute(transaction, "CREATE SEQUENCE " + sequenceName)];
                                        case 2:
                                            _e.sent();
                                            return [4 /*yield*/, connection.execute(transaction, "ALTER SEQUENCE " + sequenceName + " RESTART WITH 0")];
                                        case 3:
                                            _e.sent();
                                            _e.label = 4;
                                        case 4:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 5: return [4 /*yield*/, connection.prepare(transaction, "\n        INSERT INTO AT_RELATIONS (RELATIONNAME, LNAME, DESCRIPTION)\n        VALUES (:tableName, :lName, :description)\n      ")];
                                        case 6:
                                            atRelationsStatement = _e.sent();
                                            return [4 /*yield*/, connection.prepare(transaction, "\n        INSERT INTO AT_FIELDS (FIELDNAME, LNAME, DESCRIPTION, NUMERATION)\n        VALUES (:fieldName, :lName, :description, :numeration)\n      ")];
                                        case 7:
                                            atFieldsStatement = _e.sent();
                                            return [4 /*yield*/, connection.prepare(transaction, "\n        INSERT INTO AT_RELATION_FIELDS (FIELDNAME, RELATIONNAME, LNAME, DESCRIPTION)\n        VALUES (:fieldName, :relationName, :lName, :description)\n      ")];
                                        case 8:
                                            atRelFieldsStatement = _e.sent();
                                            _e.label = 9;
                                        case 9:
                                            _e.trys.push([9, , 23, 27]);
                                            _b = 0, _c = Object.values(erModel.entities);
                                            _e.label = 10;
                                        case 10:
                                            if (!(_b < _c.length)) return [3 /*break*/, 22];
                                            entity = _c[_b];
                                            params = {};
                                            tableName = entity.name;
                                            fields = [];
                                            attrs = Object.values(entity.attributes).filter(function (attr) { return gdmn_orm_1.isScalarAttribute(attr); });
                                            _d = 0, attrs_1 = attrs;
                                            _e.label = 11;
                                        case 11:
                                            if (!(_d < attrs_1.length)) return [3 /*break*/, 16];
                                            attr = attrs_1[_d];
                                            domainName = "DF_" + entity.name + (attrs.indexOf(attr) + 1);
                                            numeration = gdmn_orm_1.isEnumAttribute(attr)
                                                ? attr.values.map(function (_a) {
                                                    var value = _a.value, lName = _a.lName;
                                                    return value + "=" + (lName && lName.ru ? lName.ru.name : "");
                                                }).join("#13#10")
                                                : undefined;
                                            return [4 /*yield*/, atFieldsStatement.execute({
                                                    fieldName: domainName,
                                                    lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
                                                    description: attr.lName.ru ? attr.lName.ru.fullName : attr.name,
                                                    numeration: numeration ? Buffer.from(numeration) : undefined
                                                })];
                                        case 12:
                                            _e.sent();
                                            return [4 /*yield*/, atRelFieldsStatement.execute({
                                                    fieldName: attr.name,
                                                    relationName: tableName,
                                                    lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
                                                    description: attr.lName.ru ? attr.lName.ru.fullName : attr.name
                                                })];
                                        case 13:
                                            _e.sent();
                                            sql_1 = ("CREATE DOMAIN " + domainName + " AS " + getType(attr)).padEnd(62) +
                                                getDefaultValue(attr) +
                                                getNullFlag(attr) +
                                                getChecker(attr);
                                            console.debug(sql_1);
                                            return [4 /*yield*/, connection.execute(transaction, sql_1)];
                                        case 14:
                                            _e.sent();
                                            fields.push(attr.name.padEnd(31) + " " + domainName);
                                            _e.label = 15;
                                        case 15:
                                            _d++;
                                            return [3 /*break*/, 11];
                                        case 16:
                                            sql = "CREATE TABLE " + tableName + " (\n  " + fields.join(",\n  ") + "\n)";
                                            console.debug(sql);
                                            return [4 /*yield*/, connection.execute(transaction, sql, params)];
                                        case 17:
                                            _e.sent();
                                            pk = entity.pk.map(function (pk) { return pk.name; });
                                            if (!pk.length) return [3 /*break*/, 19];
                                            pkSql = "ALTER TABLE " + tableName + " ADD CONSTRAINT PK_" + tableName + " PRIMARY KEY (" + pk.join(", ") + ")";
                                            console.debug(pkSql);
                                            return [4 /*yield*/, connection.execute(transaction, pkSql)];
                                        case 18:
                                            _e.sent();
                                            _e.label = 19;
                                        case 19: return [4 /*yield*/, atRelationsStatement.execute({
                                                tableName: tableName,
                                                lName: entity.lName.ru ? entity.lName.ru.name : entity.name,
                                                description: entity.lName.ru ? entity.lName.ru.fullName : entity.name
                                            })];
                                        case 20:
                                            _e.sent();
                                            _e.label = 21;
                                        case 21:
                                            _b++;
                                            return [3 /*break*/, 10];
                                        case 22: return [3 /*break*/, 27];
                                        case 23: return [4 /*yield*/, atRelationsStatement.dispose()];
                                        case 24:
                                            _e.sent();
                                            return [4 /*yield*/, atFieldsStatement.dispose()];
                                        case 25:
                                            _e.sent();
                                            return [4 /*yield*/, atRelFieldsStatement.dispose()];
                                        case 26:
                                            _e.sent();
                                            return [7 /*endfinally*/];
                                        case 27: return [2 /*return*/];
                                    }
                                });
                            }); }
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.erImport = erImport;
function getType(attr) {
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
        expr = getIntTypeByRange(attr.minValue, attr.maxValue);
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
}
function getChecker(attr) {
    var expr = "";
    if (gdmn_orm_1.isNumberAttribute(attr)) {
        var minCond = attr.minValue !== undefined ? val2Str(attr, attr.minValue) : undefined;
        var maxCond = attr.maxValue !== undefined ? val2Str(attr, attr.maxValue) : undefined;
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
    return expr.padEnd(62);
}
function getNullFlag(attr) {
    var expr = "";
    if (attr.required) {
        expr = "NOT NULL";
    }
    return expr.padEnd(10);
}
function getDefaultValue(attr) {
    var expr = "";
    if (attr.defaultValue !== undefined) {
        expr = "DEFAULT " + val2Str(attr, attr.defaultValue);
    }
    return expr.padEnd(40);
}
function val2Str(attr, value) {
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
}
function getIntTypeByRange(min, max) {
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
}
exports.getIntTypeByRange = getIntTypeByRange;
//# sourceMappingURL=erimport.js.map