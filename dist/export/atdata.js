"use strict";
/**
 * at_* таблицы платформы Гедымин хранят дополнительную информацию по доменам,
 * таблицам и полям. При построении сущностей мы используем эту информацию
 * вместе с информацией о структуре базу данных.
 * Чтобы каждый раз не выполнять отдельные запросы, мы изначально загружаем
 * все данные в объекты.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
const gdmn_nlp_1 = require("gdmn-nlp");
const getTrimmedStringFunc = (resultSet) => (fieldName) => resultSet.isNull(fieldName) ? undefined : resultSet.getString(fieldName).trim();
async function load(connection, transaction) {
    const atfields = await gdmn_db_1.AConnection.executeQueryResultSet({
        connection,
        transaction,
        sql: `
      SELECT
        FIELDNAME,
        LNAME,
        DESCRIPTION,
        REFTABLE,
        REFCONDITION,
        SETTABLE,
        SETLISTFIELD,
        SETCONDITION,
        NUMERATION
      FROM
        AT_FIELDS`,
        callback: async (resultSet) => {
            const getTrimmedString = getTrimmedStringFunc(resultSet);
            const fields = {};
            while (await resultSet.next()) {
                const ru = { name: resultSet.getString("LNAME") };
                const fullName = getTrimmedString("DESCRIPTION");
                if (fullName) {
                    ru.fullName = fullName;
                }
                fields[resultSet.getString("FIELDNAME")] = {
                    lName: { ru },
                    refTable: getTrimmedString("REFTABLE"),
                    refCondition: getTrimmedString("REFCONDITION"),
                    setTable: getTrimmedString("SETTABLE"),
                    setListField: getTrimmedString("SETLISTFIELD"),
                    setCondition: getTrimmedString("SETCONDITION"),
                    numeration: await resultSet.getBlob("NUMERATION").asString()
                };
            }
            return fields;
        }
    });
    const atrelations = await gdmn_db_1.AConnection.executeQueryResultSet({
        connection,
        transaction,
        sql: `
      SELECT
        ID,
        RELATIONNAME,
        LNAME,
        DESCRIPTION,
        SEMCATEGORY
      FROM
        AT_RELATIONS`,
        callback: async (resultSet) => {
            const getTrimmedString = getTrimmedStringFunc(resultSet);
            const relations = {};
            while (await resultSet.next()) {
                const ru = { name: resultSet.getString("LNAME") };
                const fullName = getTrimmedString("DESCRIPTION");
                if (fullName) {
                    ru.fullName = fullName;
                }
                relations[resultSet.getString("RELATIONNAME")] = {
                    lName: { ru },
                    semCategories: gdmn_nlp_1.str2SemCategories(resultSet.getString("SEMCATEGORY")),
                    relationFields: {}
                };
            }
            return relations;
        }
    });
    await gdmn_db_1.AConnection.executeQueryResultSet({
        connection,
        transaction,
        sql: `
      SELECT
        FIELDNAME,
        FIELDSOURCE,
        RELATIONNAME,
        ATTRNAME,
        MASTERENTITYNAME,
        LNAME,
        DESCRIPTION,
        SEMCATEGORY,
        CROSSTABLE,
        CROSSFIELD
      FROM
        AT_RELATION_FIELDS
      ORDER BY
        RELATIONNAME`,
        callback: async (resultSet) => {
            const getTrimmedString = getTrimmedStringFunc(resultSet);
            let relationName = "";
            let rel;
            while (await resultSet.next()) {
                if (relationName !== resultSet.getString("RELATIONNAME")) {
                    relationName = resultSet.getString("RELATIONNAME");
                    rel = atrelations[relationName];
                    if (!rel)
                        throw new Error(`Unknown relation ${relationName}`);
                }
                const fieldName = resultSet.getString("FIELDNAME");
                const ru = { name: resultSet.getString("LNAME") };
                const fullName = getTrimmedString("DESCRIPTION");
                if (fullName) {
                    ru.fullName = fullName;
                }
                rel.relationFields[fieldName] = {
                    attrName: getTrimmedString("ATTRNAME"),
                    masterEntityName: getTrimmedString("MASTERENTITYNAME"),
                    lName: { ru },
                    fieldSource: getTrimmedString("FIELDSOURCE"),
                    crossTable: getTrimmedString("CROSSTABLE"),
                    crossField: getTrimmedString("CROSSFIELD"),
                    semCategories: gdmn_nlp_1.str2SemCategories(resultSet.getString("SEMCATEGORY"))
                };
            }
        }
    });
    return { atfields, atrelations };
}
exports.load = load;
//# sourceMappingURL=atdata.js.map