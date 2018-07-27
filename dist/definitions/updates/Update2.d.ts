import { BaseUpdate } from "./BaseUpdate";
export declare const GLOBAL_DDL_GENERATOR: string;
export declare class Update2 extends BaseUpdate {
    version: number;
    do(): Promise<void>;
}
