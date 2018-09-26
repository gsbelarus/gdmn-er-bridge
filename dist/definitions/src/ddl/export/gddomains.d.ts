import { Attribute, IAttributeAdapter, ILName } from "gdmn-orm";
export declare type createDomainFunc = (attributeName: string, lName: ILName, adapter?: IAttributeAdapter) => Attribute;
export declare const gdDomains: {
    [name: string]: createDomainFunc;
};
