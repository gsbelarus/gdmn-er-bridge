import * as erm from "gdmn-orm";
import { AttributeAdapter, LName } from "gdmn-orm";
export declare type createDomainFunc = (attributeName: string, lName: LName, adapter?: AttributeAdapter) => erm.Attribute;
export declare const gdDomains: {
    [name: string]: createDomainFunc;
};
