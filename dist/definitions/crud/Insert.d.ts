import { Step, IInsert } from "./Crud";
declare type SetsThunk = (crossPKOwn: number) => Step[];
declare type DetailsThunk = (masterKey: number) => Step[];
export declare function buildInsertSteps(input: IInsert): {
    returningStep: Step;
    setAttrsValuesThunk: SetsThunk;
    detailAttrsValuesThunk: DetailsThunk;
};
export {};
//# sourceMappingURL=Insert.d.ts.map