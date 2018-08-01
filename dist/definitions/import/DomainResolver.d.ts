import { Attribute } from "gdmn-orm";
import { IDomainProps } from "../ddl/DDLHelper";
export declare class DomainResolver {
    static resolve(attr: Attribute): IDomainProps;
    private static _getType;
    private static _getChecker;
    private static _getDefaultValue;
    private static _val2Str;
    private static _getIntTypeByRange;
}
