"use strict";
/**
 * at_* таблицы платформы Гедымин хранят дополнительную информацию по доменам,
 * таблицам и полям. При построении сущностей мы используем эту информацию
 * вместе с информацией о структуре базу данных.
 * Чтобы каждый раз не выполнять отдельные запросы, мы изначально загружаем
 * все данные в объекты.
 */
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
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
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
var gdmn_nlp_1 = require("gdmn-nlp");
var getTrimmedStringFunc = function (resultSet) {
    return function (fieldName) { return resultSet.isNull(fieldName) ? undefined : resultSet.getString(fieldName).trim(); };
};
function load(connection, transaction) {
    return __awaiter(this, void 0, void 0, function () {
        var atfields, atrelations;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, gdmn_db_1.AConnection.executeQueryResultSet({
                        connection: connection,
                        transaction: transaction,
                        sql: "\n      SELECT\n        FIELDNAME,\n        LNAME,\n        REFTABLE,\n        REFCONDITION,\n        SETTABLE,\n        SETLISTFIELD,\n        SETCONDITION\n      FROM\n        AT_FIELDS",
                        callback: function (resultSet) { return __awaiter(_this, void 0, void 0, function () {
                            var getTrimmedString, fields;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        getTrimmedString = getTrimmedStringFunc(resultSet);
                                        fields = {};
                                        _a.label = 1;
                                    case 1: return [4 /*yield*/, resultSet.next()];
                                    case 2:
                                        if (!_a.sent()) return [3 /*break*/, 3];
                                        fields[resultSet.getString("FIELDNAME")] = {
                                            lName: { ru: { name: resultSet.getString("LNAME") } },
                                            refTable: getTrimmedString("REFTABLE"),
                                            refCondition: getTrimmedString("REFCONDITION"),
                                            setTable: getTrimmedString("SETTABLE"),
                                            setListField: getTrimmedString("SETLISTFIELD"),
                                            setCondition: getTrimmedString("SETCONDITION")
                                        };
                                        return [3 /*break*/, 1];
                                    case 3: return [2 /*return*/, fields];
                                }
                            });
                        }); }
                    })];
                case 1:
                    atfields = _a.sent();
                    return [4 /*yield*/, gdmn_db_1.AConnection.executeQueryResultSet({
                            connection: connection,
                            transaction: transaction,
                            sql: "\n      SELECT\n        ID,\n        RELATIONNAME,\n        LNAME,\n        DESCRIPTION,\n        SEMCATEGORY\n      FROM\n        AT_RELATIONS",
                            callback: function (resultSet) { return __awaiter(_this, void 0, void 0, function () {
                                var relations, ru;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            relations = {};
                                            _a.label = 1;
                                        case 1: return [4 /*yield*/, resultSet.next()];
                                        case 2:
                                            if (!_a.sent()) return [3 /*break*/, 3];
                                            ru = resultSet.getString('LNAME') !== resultSet.getString(3) ?
                                                {
                                                    name: resultSet.getString('LNAME'),
                                                    fullName: resultSet.getString('DESCRIPTION')
                                                }
                                                :
                                                    {
                                                        name: resultSet.getString('LNAME')
                                                    };
                                            relations[resultSet.getString('RELATIONNAME')] = {
                                                lName: { ru: ru },
                                                semCategories: gdmn_nlp_1.str2SemCategories(resultSet.getString('SEMCATEGORY')),
                                                relationFields: {}
                                            };
                                            return [3 /*break*/, 1];
                                        case 3: return [2 /*return*/, relations];
                                    }
                                });
                            }); }
                        })];
                case 2:
                    atrelations = _a.sent();
                    return [4 /*yield*/, gdmn_db_1.AConnection.executeQueryResultSet({
                            connection: connection,
                            transaction: transaction,
                            sql: "\n      SELECT\n        FIELDNAME,\n        FIELDSOURCE,\n        RELATIONNAME,\n        LNAME,\n        DESCRIPTION,\n        SEMCATEGORY,\n        CROSSTABLE,\n        CROSSFIELD\n      FROM\n        AT_RELATION_FIELDS\n      ORDER BY\n        RELATIONNAME",
                            callback: function (resultSet) { return __awaiter(_this, void 0, void 0, function () {
                                var getTrimmedString, relationName, rel, fieldName, name, fullName, ru;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            getTrimmedString = getTrimmedStringFunc(resultSet);
                                            relationName = "";
                                            _a.label = 1;
                                        case 1: return [4 /*yield*/, resultSet.next()];
                                        case 2:
                                            if (!_a.sent()) return [3 /*break*/, 3];
                                            if (relationName !== resultSet.getString("RELATIONNAME")) {
                                                relationName = resultSet.getString("RELATIONNAME");
                                                rel = atrelations[relationName];
                                                if (!rel)
                                                    throw new Error("Unknown relation " + relationName);
                                            }
                                            fieldName = resultSet.getString("FIELDNAME");
                                            name = resultSet.getString("LNAME");
                                            fullName = resultSet.getString("DESCRIPTION");
                                            ru = fullName && fullName !== name && fullName !== fieldName ? { name: name, fullName: fullName } : { name: name };
                                            rel.relationFields[fieldName] = {
                                                lName: { ru: ru },
                                                fieldSource: getTrimmedString("FIELDSOURCE"),
                                                crossTable: getTrimmedString("CROSSTABLE"),
                                                crossField: getTrimmedString("CROSSFIELD"),
                                                semCategories: gdmn_nlp_1.str2SemCategories(resultSet.getString("SEMCATEGORY"))
                                            };
                                            return [3 /*break*/, 1];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); }
                        })];
                case 3:
                    _a.sent();
                    return [2 /*return*/, { atfields: atfields, atrelations: atrelations }];
            }
        });
    });
}
exports.load = load;
//# sourceMappingURL=atdata.js.map