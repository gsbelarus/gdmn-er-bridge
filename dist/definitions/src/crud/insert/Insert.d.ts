import { Entity, Attribute } from "gdmn-orm";
import { AConnection } from "gdmn-db";
export interface IDatum {
    attribute: Attribute;
    value: any;
}
export declare abstract class Insert {
    static execute(connection: AConnection, entity: Entity, datums: IDatum[]): Promise<void>;
}
