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
function loadDocument(connection, transaction, loadDocumentFunc) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, gdmn_db_1.AConnection.executeQueryResultSet({
                        connection: connection,
                        transaction: transaction,
                        sql: "\n      SELECT\n        dt.id,\n        dt.ruid,\n        prnt.ruid AS parent_ruid,\n        prnt.documenttype AS parent_documenttype,\n        dt.documenttype,\n        dt.name,\n        dt.classname,\n        root.classname AS root_classname,\n        headerrel.relationname AS hr,\n        linerel.relationname AS lr\n      FROM\n        gd_documenttype dt\n        LEFT JOIN gd_documenttype prnt\n          ON prnt.id = dt.parent\n        JOIN gd_documenttype root\n          ON root.lb <= dt.lb AND root.rb >= dt.rb AND root.parent IS NULL\n        LEFT JOIN at_relations headerrel\n          ON headerrel.id = dt.headerrelkey\n        LEFT JOIN at_relations linerel\n          ON linerel.id = dt.linerelkey\n      ORDER BY\n        dt.lb",
                        callback: function (rs) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, rs.next()];
                                    case 1:
                                        if (!_a.sent()) return [3 /*break*/, 2];
                                        if (rs.getString("DOCUMENTTYPE") === "D") {
                                            loadDocumentFunc(rs.getNumber("ID"), rs.getString("RUID"), !rs.isNull("PARENT_RUID") && rs.getString("PARENT_DOCUMENTTYPE") === "D" ? rs.getString("PARENT_RUID") : "", rs.getString("NAME"), rs.getString("CLASSNAME") ? rs.getString("CLASSNAME") : rs.getString("ROOT_CLASSNAME"), rs.getString("HR"), rs.isNull("LR") ? "" : rs.getString("LR"));
                                        }
                                        return [3 /*break*/, 0];
                                    case 2: return [2 /*return*/];
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
}
exports.loadDocument = loadDocument;
//# sourceMappingURL=document.js.map