import * as erm from 'gdmn-orm';
import { LName } from 'gdmn-orm';
import { Attribute2FieldMap } from 'gdmn-orm';
export declare type createDomainFunc = (attributeName: string, lName: LName, adapter?: Attribute2FieldMap) => erm.Attribute;
export declare const gdDomains: {
    [name: string]: createDomainFunc;
};
