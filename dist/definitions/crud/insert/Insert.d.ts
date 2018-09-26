import { Entity, SetAttribute, DetailAttribute, IAttribute } from "gdmn-orm";
import { AConnection } from "gdmn-db";
export interface IInsertData {
    entity: Entity;
    attrsToValues: {
        attribute: IAttribute;
        value: any;
    }[];
    links?: {
        attribute: SetAttribute | DetailAttribute;
        pkValues?: any[];
        attrsToValues: {
            attribute: IAttribute;
            value: any;
        }[];
    }[];
}
export declare abstract class Insert {
    static execute(connection: AConnection, insertData: IInsertData): Promise<void>;
}
