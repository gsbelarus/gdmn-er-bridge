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
var DDLHelper_1 = require("../DDLHelper");
var createATStructure_1 = require("./createATStructure");
var createDefaultDomains_1 = require("./createDefaultDomains");
var createDefaultGenerators_1 = require("./createDefaultGenerators");
var createDocStructure_1 = require("./createDocStructure");
var DomainResolver_1 = require("./DomainResolver");
var Prefix_1 = require("./Prefix");
var ERImport = /** @class */ (function () {
    function ERImport(connection, erModel) {
        this._connection = connection;
        this._erModel = erModel;
    }
    ERImport._tableName = function (entity) {
        return entity.name;
    };
    ERImport._fieldName = function (attr) {
        var attrAdapter = attr.adapter;
        return attrAdapter ? attrAdapter.field : attr.name;
    };
    ERImport.prototype.execute = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._createDefaultSchema()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, gdmn_db_1.AConnection.executeTransaction({
                                connection: this._connection,
                                callback: function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                this._ddlHelper = new DDLHelper_1.DDLHelper(this._connection, transaction);
                                                _a.label = 1;
                                            case 1:
                                                _a.trys.push([1, , 5, 6]);
                                                return [4 /*yield*/, this._prepareStatements(transaction)];
                                            case 2:
                                                _a.sent();
                                                return [4 /*yield*/, this._createERSchema()];
                                            case 3:
                                                _a.sent();
                                                return [4 /*yield*/, this._disposeStatements()];
                                            case 4:
                                                _a.sent();
                                                return [3 /*break*/, 6];
                                            case 5:
                                                console.debug(this._ddlHelper.logs.join("\n"));
                                                return [7 /*endfinally*/];
                                            case 6: return [2 /*return*/];
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
    };
    ERImport.prototype._prepareStatements = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this._connection.prepare(transaction, "\n      INSERT INTO AT_FIELDS (FIELDNAME, LNAME, DESCRIPTION, NUMERATION)\n      VALUES (:fieldName, :lName, :description, :numeration)\n    ")];
                    case 1:
                        _a._createATField = _d.sent();
                        _b = this;
                        return [4 /*yield*/, this._connection.prepare(transaction, "\n      INSERT INTO AT_RELATIONS (RELATIONNAME, LNAME, DESCRIPTION)\n      VALUES (:tableName, :lName, :description)\n    ")];
                    case 2:
                        _b._createATRelation = _d.sent();
                        _c = this;
                        return [4 /*yield*/, this._connection.prepare(transaction, "\n      INSERT INTO AT_RELATION_FIELDS (FIELDNAME, RELATIONNAME, ATTRNAME, LNAME, DESCRIPTION)\n      VALUES (:fieldName, :relationName, :attrName, :lName, :description)\n    ")];
                    case 3:
                        _c._createATRelationField = _d.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ERImport.prototype._disposeStatements = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._createATField) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._createATField.dispose()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this._createATRelation) return [3 /*break*/, 4];
                        return [4 /*yield*/, this._createATRelation.dispose()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!this._createATRelationField) return [3 /*break*/, 6];
                        return [4 /*yield*/, this._createATRelationField.dispose()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ERImport.prototype._createDefaultSchema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, gdmn_db_1.AConnection.executeTransaction({
                            connection: this._connection,
                            callback: function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, createDefaultGenerators_1.createDefaultGenerators(this._connection, transaction)];
                                        case 1:
                                            _a.sent();
                                            return [4 /*yield*/, createDefaultDomains_1.createDefaultDomains(this._connection, transaction)];
                                        case 2:
                                            _a.sent();
                                            return [4 /*yield*/, createATStructure_1.createATStructure(this._connection, transaction)];
                                        case 3:
                                            _a.sent();
                                            return [4 /*yield*/, createDocStructure_1.createDocStructure(this._connection, transaction)];
                                        case 4:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ERImport.prototype._createERSchema = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, sequence, sequenceName, _b, _c, entity;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _i = 0, _a = Object.values(this._erModel.sequencies);
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        sequence = _a[_i];
                        sequenceName = sequence.adapter ? sequence.adapter.sequence : sequence.name;
                        if (!(sequenceName !== Prefix_1.Prefix.join(createDefaultGenerators_1.G_UNIQUE_NAME, Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR))) return [3 /*break*/, 3];
                        if (!this._ddlHelper) return [3 /*break*/, 3];
                        return [4 /*yield*/, this._ddlHelper.addSequence(sequenceName)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        _b = 0, _c = Object.values(this._erModel.entities);
                        _d.label = 5;
                    case 5:
                        if (!(_b < _c.length)) return [3 /*break*/, 8];
                        entity = _c[_b];
                        return [4 /*yield*/, this._addEntity(entity)];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _b++;
                        return [3 /*break*/, 5];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    ERImport.prototype._addEntity = function (entity) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, fields, _i, _a, attr, domainName;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        tableName = ERImport._tableName(entity);
                        fields = [];
                        _i = 0, _a = Object.values(entity.attributes).filter(function (attr) { return gdmn_orm_1.isScalarAttribute(attr); });
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        attr = _a[_i];
                        return [4 /*yield*/, this._addScalarDomain(entity, attr)];
                    case 2:
                        domainName = _b.sent();
                        return [4 /*yield*/, this._bindATAttr(entity, attr, domainName)];
                    case 3:
                        _b.sent();
                        fields.push({
                            name: ERImport._fieldName(attr),
                            domain: domainName
                        });
                        _b.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        if (!this._ddlHelper) return [3 /*break*/, 8];
                        return [4 /*yield*/, this._ddlHelper.addTable(tableName, fields)];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, this._ddlHelper.addPrimaryKey(tableName, entity.pk.map(function (item) { return item.name; }))];
                    case 7:
                        _b.sent();
                        _b.label = 8;
                    case 8: return [4 /*yield*/, this._bindATEntity(entity, tableName)];
                    case 9:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ERImport.prototype._addScalarDomain = function (entity, attr) {
        return __awaiter(this, void 0, void 0, function () {
            var domainName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        domainName = Prefix_1.Prefix.join(entity.name + "_F" + (Object.keys(entity.attributes).indexOf(attr.name) + 1), Prefix_1.Prefix.DOMAIN);
                        if (!this._ddlHelper) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._ddlHelper.addScalarDomain(domainName, DomainResolver_1.DomainResolver.resolveScalar(attr))];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, domainName];
                }
            });
        });
    };
    ERImport.prototype._bindATEntity = function (entity, tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._createATRelation) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._createATRelation.execute({
                                tableName: tableName,
                                lName: entity.lName.ru ? entity.lName.ru.name : entity.name,
                                description: entity.lName.ru ? entity.lName.ru.fullName : entity.name
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    ERImport.prototype._bindATAttr = function (entity, attr, domainName) {
        return __awaiter(this, void 0, void 0, function () {
            var numeration, fieldName;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        numeration = gdmn_orm_1.isEnumAttribute(attr)
                            ? attr.values.map(function (_a) {
                                var value = _a.value, lName = _a.lName;
                                return value + "=" + (lName && lName.ru ? lName.ru.name : "");
                            }).join("#13#10")
                            : undefined;
                        if (!this._createATField) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._createATField.execute({
                                fieldName: domainName,
                                lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
                                description: attr.lName.ru ? attr.lName.ru.fullName : attr.name,
                                numeration: numeration ? Buffer.from(numeration) : undefined
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!this._createATRelationField) return [3 /*break*/, 4];
                        fieldName = ERImport._fieldName(attr);
                        return [4 /*yield*/, this._createATRelationField.execute({
                                fieldName: fieldName,
                                relationName: ERImport._tableName(entity),
                                attrName: fieldName !== attr.name ? attr.name : null,
                                lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
                                description: attr.lName.ru ? attr.lName.ru.fullName : attr.name
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ERImport;
}());
exports.ERImport = ERImport;
//# sourceMappingURL=ERImport.js.map