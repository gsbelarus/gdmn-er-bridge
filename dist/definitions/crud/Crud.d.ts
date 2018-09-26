import { Entity, SetAttribute, DetailAttribute, ScalarAttribute, EntityAttribute } from "gdmn-orm";
import { AConnection } from "gdmn-db";
export declare type Scalar = string | boolean | number | Date | null;
export interface IScalarAttrValue {
    attribute: ScalarAttribute;
    value: Scalar;
}
export interface IEntityAttrValue {
    attribute: EntityAttribute;
    values: Scalar[];
}
export interface ISetAttrValue {
    attribute: SetAttribute;
    crossValues: IScalarAttrValue[][];
    currRefIDs?: number[];
    refIDs: number[];
}
export interface IDetailAttrValue {
    attribute: DetailAttribute;
    pks: Scalar[][];
}
export interface IAttrsValuesByType {
    scalarAttrsValues: IScalarAttrValue[];
    entityAttrsValues: IEntityAttrValue[];
    detailAttrsValues: IDetailAttrValue[];
    setAttrsValues: ISetAttrValue[];
}
export declare type AttrsValues = Array<IScalarAttrValue | IEntityAttrValue | ISetAttrValue | IDetailAttrValue>;
export interface IInsert {
    entity: Entity;
    attrsValues: AttrsValues;
}
export interface IUpdate extends IInsert {
    pk: any[];
}
export interface IUpdateOrInsert extends IInsert {
    pk?: any[];
}
export interface IDelete {
    pk: any[];
    entity: Entity;
}
export declare type Step = {
    sql: string;
    params: {};
};
export declare abstract class Crud {
    static executeInsert(connection: AConnection, input: IInsert | Array<IInsert>): Promise<number[]>;
    static executeUpdateOrInsert(connection: AConnection, input: IUpdateOrInsert | Array<IUpdateOrInsert>): Promise<Array<number>>;
    static executeUpdate(connection: AConnection, input: IUpdate | IUpdate[]): Promise<void>;
    static executeDelete(connection: AConnection, input: IDelete | IDelete[]): Promise<void>;
}
