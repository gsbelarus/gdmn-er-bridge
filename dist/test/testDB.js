"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gdmn_db_1 = require("gdmn-db");
exports.testDB = [
    {
        alias: "test",
        driver: gdmn_db_1.Factory.FBDriver,
        options: {
            host: "localhost",
            port: 3050,
            username: "SYSDBA",
            password: "masterkey",
            path: "c:\\golden\\ns\\gdmn-back\\test\\db\\test.fdb"
        }
    },
    {
        alias: "broiler",
        driver: gdmn_db_1.Factory.FBDriver,
        options: {
            host: "brutto",
            port: 3053,
            username: "SYSDBA",
            password: "masterkey",
            path: "k:\\bases\\broiler\\GDBASE_2017_10_02.FDB"
        }
    }
];
//# sourceMappingURL=testDB.js.map