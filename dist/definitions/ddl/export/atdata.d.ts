/**
 * at_* таблицы платформы Гедымин хранят дополнительную информацию по доменам,
 * таблицам и полям. При построении сущностей мы используем эту информацию
 * вместе с информацией о структуре базу данных.
 * Чтобы каждый раз не выполнять отдельные запросы, мы изначально загружаем
 * все данные в объекты.
 */
import { AConnection, ATransaction } from "gdmn-db";
import { SemCategory } from "gdmn-nlp";
import { ILName } from "gdmn-orm";
/**
 * Дополнительная информация по доменам.
 */
export interface IATField {
    lName: ILName;
    refTable: string | undefined;
    refCondition: string | undefined;
    setTable: string | undefined;
    setListField: string | undefined;
    setCondition: string | undefined;
    numeration: string | undefined;
}
export interface IATFields {
    [fieldName: string]: IATField;
}
/**
 * Дополнительная информация по полям таблиц.
 */
export interface IATRelationField {
    attrName: string | undefined;
    masterEntityName: string | undefined;
    isParent: boolean;
    lbFieldName: string | undefined;
    rbFieldName: string | undefined;
    lName: ILName;
    fieldSource: string;
    fieldSourceKey: number;
    crossTable: string | undefined;
    crossTableKey: number | undefined;
    crossField: string | undefined;
    semCategories: SemCategory[];
}
export interface IATRelationFields {
    [fieldName: string]: IATRelationField;
}
/**
 * Дополнительная информация по таблицам.
 */
export interface IATRelation {
    lName: ILName;
    entityName: string | undefined;
    semCategories: SemCategory[];
    relationFields: IATRelationFields;
}
export interface IATRelations {
    [relationName: string]: IATRelation;
}
export interface IATLoadResult {
    atFields: IATFields;
    atRelations: IATRelations;
}
export declare function load(connection: AConnection, transaction: ATransaction): Promise<IATLoadResult>;
