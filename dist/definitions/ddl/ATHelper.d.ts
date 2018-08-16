/// <reference types="node" />
import { AConnection, ATransaction } from "gdmn-db";
export interface IInputATRelationFields {
    fieldName: string;
    relationName: string;
    lName: string;
    description: string | undefined;
    attrName: string | undefined;
    masterEntityName: string | undefined;
    isParent: boolean | undefined;
    fieldSource: string;
    fieldSourceKey: number;
    semCategory: string | undefined;
    crossTable: string | undefined;
    crossTableKey: number | undefined;
    crossField: string | undefined;
}
export interface IInputATRelations {
    relationName: string;
    relationType: "T" | "V" | undefined;
    lName: string;
    description: string | undefined;
    entityName: string | undefined;
    semCategory: string | undefined;
}
export interface IInputATFields {
    fieldName: string;
    lName: string;
    description: string | undefined;
    refTable: string | undefined;
    refCondition: string | undefined;
    setTable: string | undefined;
    setListField: string | undefined;
    setCondition: string | undefined;
    numeration: Buffer | undefined;
}
export declare class ATHelper {
    private readonly _connection;
    private readonly _transaction;
    private _createATField;
    private _createATRelation;
    private _createATRelationField;
    constructor(connection: AConnection, transaction: ATransaction);
    prepare(): Promise<void>;
    dispose(): Promise<void>;
    insertATRelations(input: IInputATRelations): Promise<number>;
    insertATFields(input: IInputATFields): Promise<number>;
    insertATRelationFields(input: IInputATRelationFields): Promise<number>;
}
