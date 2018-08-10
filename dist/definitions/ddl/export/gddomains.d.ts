import { Attribute, AttributeAdapter, LName } from "gdmn-orm";
export declare type createDomainFunc = (attributeName: string, lName: LName, adapter?: AttributeAdapter) => Attribute;
export declare const gdDomains: {
    [name: string]: createDomainFunc;
};
