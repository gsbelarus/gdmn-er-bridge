import { BaseUpdate } from "./BaseUpdate";
export declare class Update2 extends BaseUpdate {
    protected _version: number;
    protected _description: string;
    run(): Promise<void>;
}
