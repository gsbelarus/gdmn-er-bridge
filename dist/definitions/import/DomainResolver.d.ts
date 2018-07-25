import { ScalarAttribute } from "gdmn-orm";
export interface IDomainOptions {
    type: string;
    default: string;
    nullable: string;
    check: string;
}
export declare class DomainResolver {
    static resolveScalar(attr: ScalarAttribute): IDomainOptions;
    private static _getScalarType;
    private static _getScalarChecker;
    private static _getNullFlag;
    private static _getDefaultValue;
    private static _val2Str;
    private static _getIntTypeByRange;
}
