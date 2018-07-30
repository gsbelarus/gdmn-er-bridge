import { ScalarAttribute } from "gdmn-orm";
import { IDomainProps } from "../ddl/DDLHelper";
export declare class DomainResolver {
    static resolveScalar(attr: ScalarAttribute): IDomainProps;
    private static _getScalarType;
    private static _getScalarChecker;
    private static _getDefaultValue;
    private static _val2Str;
    private static _getIntTypeByRange;
}
