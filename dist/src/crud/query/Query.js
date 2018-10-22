"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
const gdmn_orm_1 = require("gdmn-orm");
const SelectBuilder_1 = require("./SelectBuilder");
// TODO remove
class Query {
    static async execute(connection, erModel, dbStructure, query) {
        const bodyQuery = gdmn_orm_1.EntityQuery.inspectorToObject(erModel, query);
        const { sql, params, fieldAliases } = new SelectBuilder_1.SelectBuilder(dbStructure, bodyQuery).build();
        const data = await gdmn_db_1.AConnection.executeTransaction({
            connection,
            options: { accessMode: gdmn_db_1.AccessMode.READ_ONLY },
            callback: (transaction) => gdmn_db_1.AConnection.executeQueryResultSet({
                connection,
                transaction,
                sql,
                params,
                callback: async (resultSet) => {
                    const result = [];
                    while (await resultSet.next()) {
                        const row = {};
                        for (let i = 0; i < resultSet.metadata.columnCount; i++) {
                            // TODO binary blob support
                            row[resultSet.metadata.getColumnLabel(i)] = await resultSet.getAny(i);
                        }
                        result.push(row);
                    }
                    return result;
                }
            })
        });
        const aliases = [];
        for (const [key, value] of fieldAliases) {
            const link = bodyQuery.link.deepFindLinkByField(key);
            if (!link) {
                throw new Error("Field not found");
            }
            aliases.push({
                alias: link.alias,
                attribute: key.attribute.name,
                values: value
            });
        }
        return {
            data,
            aliases,
            sql: {
                query: sql,
                params
            }
        };
    }
}
exports.Query = Query;
//# sourceMappingURL=Query.js.map