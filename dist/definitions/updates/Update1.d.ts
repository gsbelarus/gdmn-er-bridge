import { BaseUpdate } from "./BaseUpdate";
export declare const GLOBAL_GENERATOR: string;
export declare class Update1 extends BaseUpdate {
    version: number;
    run(): Promise<void>;
}
