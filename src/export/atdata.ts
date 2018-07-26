/**
 * at_* таблицы платформы Гедымин хранят дополнительную информацию по доменам,
 * таблицам и полям. При построении сущностей мы используем эту информацию
 * вместе с информацией о структуре базу данных.
 * Чтобы каждый раз не выполнять отдельные запросы, мы изначально загружаем
 * все данные в объекты.
 */

import {AConnection, AResultSet, ATransaction} from "gdmn-db";
import {SemCategory, str2SemCategories} from "gdmn-nlp";
import {LName, TName} from "gdmn-orm";

/**
 * Дополнительная информация по доменам.
 */
export interface atField {
  lName: LName;
  refTable: string | undefined;
  refCondition: string | undefined;
  setTable: string | undefined;
  setListField: string | undefined;
  setCondition: string | undefined;
  numeration: string | undefined;
}

export interface atFields {
  [fieldName: string]: atField;
}

/**
 * Дополнительная информация по полям таблиц.
 */
export interface atRelationField {
  attrName: string | undefined;
  lName: LName;
  fieldSource: string;
  crossTable: string | undefined;
  crossField: string | undefined;
  semCategories: SemCategory[];
}

export interface atRelationFields {
  [fieldName: string]: atRelationField;
}

/**
 * Дополнительная информация по таблицам.
 */
export interface atRelation {
  lName: LName;
  semCategories: SemCategory[];
  relationFields: atRelationFields;
}

export interface atRelations {
  [relationName: string]: atRelation;
}

const getTrimmedStringFunc = (resultSet: AResultSet) =>
  (fieldName: string) => resultSet.isNull(fieldName) ? undefined : resultSet.getString(fieldName).trim();

export async function load(connection: AConnection, transaction: ATransaction) {
  const atfields = await AConnection.executeQueryResultSet({
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
      const fields: atFields = {};
      while (await resultSet.next()) {
        const ru: TName = {name: resultSet.getString("LNAME")};
        const fullName = getTrimmedString("DESCRIPTION");
        if (fullName) {
          ru.fullName = fullName;
        }
        fields[resultSet.getString("FIELDNAME")] = {
          lName: {ru},
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

  const atrelations = await AConnection.executeQueryResultSet({
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
      const relations: atRelations = {};
      while (await resultSet.next()) {
        const ru: TName = {name: resultSet.getString("LNAME")};
        const fullName = getTrimmedString("DESCRIPTION");
        if (fullName) {
          ru.fullName = fullName;
        }
        relations[resultSet.getString("RELATIONNAME")] = {
          lName: {ru},
          semCategories: str2SemCategories(resultSet.getString("SEMCATEGORY")),
          relationFields: {}
        };
      }
      return relations;
    }
  });

  await AConnection.executeQueryResultSet({
    connection,
    transaction,
    sql: `
      SELECT
        FIELDNAME,
        FIELDSOURCE,
        RELATIONNAME,
        ATTRNAME,
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
      let relationName: string = "";
      let rel: atRelation;
      while (await resultSet.next()) {
        if (relationName !== resultSet.getString("RELATIONNAME")) {
          relationName = resultSet.getString("RELATIONNAME");
          rel = atrelations[relationName];
          if (!rel) throw new Error(`Unknown relation ${relationName}`);
        }
        const fieldName = resultSet.getString("FIELDNAME");
        const attrName = getTrimmedString("ATTRNAME");
        const ru: TName = {name: resultSet.getString("LNAME")};
        const fullName = getTrimmedString("DESCRIPTION");
        if (fullName) {
          ru.fullName = fullName;
        }
        rel!.relationFields[fieldName] = {
          attrName,
          lName: {ru},
          fieldSource: getTrimmedString("FIELDSOURCE")!,
          crossTable: getTrimmedString("CROSSTABLE"),
          crossField: getTrimmedString("CROSSFIELD"),
          semCategories: str2SemCategories(resultSet.getString("SEMCATEGORY"))
        };
      }
    }
  });

  return {atfields, atrelations};
}
