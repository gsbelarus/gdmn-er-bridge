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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var gdmn_db_1 = require("gdmn-db");
var gdmn_orm_1 = require("gdmn-orm");
var __1 = require("..");
var testDB_1 = require("./testDB");
function loadERModel(dbDetail) {
    return __awaiter(this, void 0, void 0, function () {
        var driver, options, result;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    driver = dbDetail.driver, options = dbDetail.options;
                    console.log(JSON.stringify(options, undefined, 2));
                    console.time("Total load time");
                    return [4 /*yield*/, gdmn_db_1.AConnection.executeConnection({
                            connection: driver.newConnection(),
                            options: options,
                            callback: function (connection) { return gdmn_db_1.AConnection.executeTransaction({
                                connection: connection,
                                callback: function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                    var dbStructure, erModel;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                console.time("DBStructure load time");
                                                return [4 /*yield*/, driver.readDBStructure(connection, transaction)];
                                            case 1:
                                                dbStructure = _a.sent();
                                                console.log("DBStructure: " + Object.entries(dbStructure.relations).length + " relations loaded...");
                                                console.timeEnd("DBStructure load time");
                                                console.time("erModel load time");
                                                return [4 /*yield*/, __1.erExport(dbStructure, connection, transaction, new gdmn_orm_1.ERModel())];
                                            case 2:
                                                erModel = _a.sent();
                                                console.log("erModel: loaded " + Object.entries(erModel.entities).length + " entities");
                                                console.timeEnd("erModel load time");
                                                return [2 /*return*/, {
                                                        dbStructure: dbStructure,
                                                        erModel: erModel
                                                    }];
                                        }
                                    });
                                }); }
                            }); }
                        })];
                case 1:
                    result = _a.sent();
                    return [2 /*return*/, result];
            }
        });
    });
}
test("erModel", function () { return __awaiter(_this, void 0, void 0, function () {
    var result, serialized, deserialized;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, loadERModel(testDB_1.testDB[1])];
            case 1:
                result = _a.sent();
                serialized = result.erModel.serialize();
                deserialized = gdmn_orm_1.deserializeERModel(serialized);
                if (fs.existsSync("c:/temp/test")) {
                    fs.writeFileSync("c:/temp/test/ermodel.json", result.erModel.inspect().reduce(function (p, s) { return "" + p + s + "\n"; }, ""));
                    console.log("ERModel has been written to c:/temp/test/ermodel.json");
                    fs.writeFileSync("c:/temp/test/ermodel.serialized.json", JSON.stringify(serialized, undefined, 2));
                    console.log("Serialized ERModel has been written to c:/temp/test/ermodel.serialized.json");
                    fs.writeFileSync("c:/temp/test/ermodel.test.json", JSON.stringify(deserialized.serialize(), undefined, 2));
                    console.log("Deserialized ERModel has been written to c:/temp/test/ermodel.test.json");
                }
                expect(serialized).toEqual(deserialized.serialize());
                return [2 /*return*/];
        }
    });
}); }, 40000);
//# sourceMappingURL=ermodel.test.js.map