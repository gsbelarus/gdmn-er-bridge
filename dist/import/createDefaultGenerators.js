"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Prefix_1 = require("./Prefix");
exports.G_UNIQUE_NAME = "UNIQUE";
exports.G_UNIQUE_DDL_NAME = "DDL";
async function createDefaultGenerators(connection, transaction) {
    await connection.execute(transaction, `CREATE SEQUENCE ${Prefix_1.Prefix.join(exports.G_UNIQUE_NAME, Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR)}`);
    await connection.execute(transaction, `ALTER SEQUENCE ${Prefix_1.Prefix.join(exports.G_UNIQUE_NAME, Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR)} RESTART WITH 0`);
    await connection.execute(transaction, `CREATE SEQUENCE ${Prefix_1.Prefix.join(exports.G_UNIQUE_DDL_NAME, Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR)}`);
    await connection.execute(transaction, `ALTER SEQUENCE ${Prefix_1.Prefix.join(exports.G_UNIQUE_DDL_NAME, Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR)} RESTART WITH 0`);
}
exports.createDefaultGenerators = createDefaultGenerators;
//# sourceMappingURL=createDefaultGenerators.js.map