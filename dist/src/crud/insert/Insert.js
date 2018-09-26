"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
class SQLInsertBuilder {
    constructor(entity, datums) {
        this._entity = entity;
        // this._dbStructure = dbStructure;
        this._datums = datums;
    }
    build() {
        const tableName = this._entity.name;
        const attributesNames = this._datums.map((d) => d.attribute.name);
        const valuesPlaceholders = attributesNames.map((attr) => `:${attr}`);
        const values = this._datums.map((d) => d.value);
        const params = attributesNames.reduce((acc, currName, currIndex) => {
            return { ...acc, [currName]: values[currIndex] };
        }, {});
        const sql = `INSERT INTO ${tableName} (${attributesNames})
VALUES (${valuesPlaceholders})`;
        console.log("Table Name: ", tableName);
        console.log("sql: ", sql);
        console.log("params: ", params);
        return { sql, params };
    }
}
class Insert {
    static async execute(connection, 
    // dbStructure: DBStructure,
    entity, datums) {
        const { sql, params, } = new SQLInsertBuilder(entity, datums).build();
        // TODO: catch exception from database
        await gdmn_db_1.AConnection.executeTransaction({
            connection,
            callback: async (transaction) => {
                await connection.execute(transaction, sql, params // values for sql
                );
            }
        });
    }
}
exports.Insert = Insert;
//# sourceMappingURL=Insert.js.map