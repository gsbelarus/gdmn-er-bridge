/**
 * at_* таблицы платформы Гедымин хранят дополнительную информацию по доменам,
 * таблицам и полям. При построении сущностей мы используем эту информацию
 * вместе с информацией о структуре базу данных.
 * Чтобы каждый раз не выполнять отдельные запросы, мы изначально загружаем
 * все данные в объекты.
 */
import { AConnection, ATransaction } from "gdmn-db";
import { SemCategory } from "gdmn-nlp";
import { LName } from "gdmn-orm";
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
    masterEntityName: string | undefined;
    isParent: boolean;
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
export declare function load(connection: AConnection, transaction: ATransaction): Promise<{
    atfields: atFields;
    atrelations: atRelations;
}>;
