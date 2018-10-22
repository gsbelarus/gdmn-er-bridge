import { IAttrsValuesByType, AttrsValues, ISetAttrValue, IDetailAttrValue, Step } from "./Crud";
export declare function flatten(nestedList: any[][]): any[];
export declare function zip3(xs: any[], ys: any[], zs: any[]): any[];
export declare function groupAttrsValuesByType(attrsValues: AttrsValues): IAttrsValuesByType;
export declare function makeDetailAttrsSteps(masterKeyValue: number, detailAttrsValues: IDetailAttrValue[]): Step[];
export declare function makeSetAttrsSteps(makeSQL: (tableName: string, attrsNames: string[], placeholders: string[]) => string, crossPKOwn: number, setAttrsValues: ISetAttrValue[]): Step[];
//# sourceMappingURL=common.d.ts.map