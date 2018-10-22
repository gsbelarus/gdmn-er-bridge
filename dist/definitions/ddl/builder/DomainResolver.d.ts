import { Attribute } from "gdmn-orm";
import { IDomainProps } from "./DDLHelper";
export declare class DomainResolver {
    static resolve(attr: Attribute): IDomainProps;
    private static _getType;
    private static _getChecker;
    private static _getDefaultValue;
    private static _val2Str;
    private static _getIntTypeByRange;
    private static _date2Str;
    private static _dateTime2Str;
    private static _time2Str;
}
//# sourceMappingURL=DomainResolver.d.ts.map