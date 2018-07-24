import { ContextVariables } from "gdmn-orm";
export declare const MIN_TIMESTAMP: Date;
export declare const MAX_TIMESTAMP: Date;
export interface IRange<T> {
    minValue: T | undefined;
    maxValue: T | undefined;
}
export declare function isCheckForBoolean(validationSource: string | null): boolean;
export declare function check2Enum(validationSource: string | null): string[];
export declare function check2StrMin(validationSource: string | null): number | undefined;
export declare function check2NumberRange(validationSource: string | null, rangeLimit?: {
    min: number;
    max: number;
}): IRange<number>;
export declare function check2TimestampRange(validationSource: string | null): IRange<Date>;
export declare function check2TimeRange(validationSource: string | null): IRange<Date>;
export declare function check2DateRange(validationSource: string | null): IRange<Date>;
export declare function checkRange(validationSource: string | null): {
    min: string | undefined;
    max: string | undefined;
};
export declare function cropDefault(defaultSource: string | null): string | null;
export declare function default2Boolean(defaultSource: string | null): boolean;
export declare function default2Int(defaultSource: string | null): number | undefined;
export declare function default2Number(defaultSource: string | null): number | undefined;
export declare function default2String(defaultSource: string | null): string | undefined;
export declare function default2Time(defaultSource: string | null): Date | ContextVariables | undefined;
export declare function default2Timestamp(defaultSource: string | null): Date | ContextVariables | undefined;
export declare function default2Date(defaultSource: string | null): Date | ContextVariables | undefined;
export declare function date2Str(date: Date | ContextVariables): string;
export declare function dateTime2Str(date: Date | ContextVariables): string;
export declare function time2Str(date: Date | ContextVariables): string;
