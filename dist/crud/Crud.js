"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
const UpdateOrInsert_1 = require("./UpdateOrInsert");
const Update_1 = require("./Update");
const Insert_1 = require("./Insert");
const Delete_1 = require("./Delete");
const common_1 = require("./common");
async function runPrepNestedSteps(connection, transaction, nestedSteps) {
    if (common_1.flatten(nestedSteps).length > 0) {
        for (const setSteps of nestedSteps) {
            const generalSQL = setSteps[0].sql;
            const statement = await connection.prepare(transaction, generalSQL);
            for (const { params } of setSteps) {
                await statement.execute(params);
            }
        }
    }
}
class Crud {
    static async executeInsert(connection, input) {
        const datoms = Array.isArray(input) ? input : [input];
        const nestedSteps = datoms.map(d => Insert_1.buildInsertSteps(d));
        const returningSteps = nestedSteps.map(({ returningStep }) => returningStep);
        const returningSQL = returningSteps[0].sql;
        const returningNestedParams = returningSteps.map(({ params }) => params);
        const ids = await gdmn_db_1.AConnection.executeTransaction({
            connection,
            callback: async (transaction) => {
                const returningStatement = await connection.prepare(transaction, returningSQL);
                let ids = [];
                for (const params of returningNestedParams) {
                    const result = await returningStatement.executeReturning(params);
                    const id = result.getNumber("ID");
                    ids.push(id);
                }
                const setsNestedSteps = nestedSteps.map(({ setAttrsValuesThunk }, currIndex) => setAttrsValuesThunk(ids[currIndex]));
                await runPrepNestedSteps(connection, transaction, setsNestedSteps);
                const detailsNestedSteps = nestedSteps.map(({ detailAttrsValuesThunk }, currIndex) => detailAttrsValuesThunk(ids[currIndex]));
                await runPrepNestedSteps(connection, transaction, detailsNestedSteps);
                return ids;
            }
        });
        return ids;
    }
    static async executeUpdateOrInsert(connection, input) {
        const datoms = Array.isArray(input) ? input : [input];
        const datomsWithPK = datoms.filter(d => d.pk);
        const nestedSteps = datomsWithPK.map(d => UpdateOrInsert_1.buildUpdateOrInsertSteps(d));
        const flattenSteps = common_1.flatten(nestedSteps);
        await gdmn_db_1.AConnection.executeTransaction({
            connection,
            callback: async (transaction) => {
                for (const { sql, params } of flattenSteps) {
                    await connection.executeReturning(transaction, sql, params);
                }
            },
        });
        const datomsWithoutPK = datoms.filter(d => !d.pk);
        if (datomsWithoutPK.length > 0) {
            const ids = await Crud.executeInsert(connection, datomsWithoutPK);
            return ids;
        }
        return [];
    }
    static async executeUpdate(connection, input) {
        const datoms = Array.isArray(input) ? input : [input];
        const nestedSteps = datoms.map(d => Update_1.buildUpdateSteps(d));
        const flattenSteps = common_1.flatten(nestedSteps);
        await gdmn_db_1.AConnection.executeTransaction({
            connection,
            callback: async (transaction) => {
                for (const { sql, params } of flattenSteps) {
                    await connection.executeReturning(transaction, sql, params);
                }
            },
        });
    }
    static async executeDelete(connection, input) {
        const datoms = Array.isArray(input) ? input : [input];
        const nestedSteps = datoms.map(d => Delete_1.buildDeleteSteps(d));
        const flattenSteps = common_1.flatten(nestedSteps);
        await gdmn_db_1.AConnection.executeTransaction({
            connection,
            callback: async (transaction) => {
                for (const { sql, params } of flattenSteps) {
                    await connection.execute(transaction, sql, params);
                }
            }
        });
    }
}
exports.Crud = Crud;
//# sourceMappingURL=Crud.js.map