import { BaseUpdate } from "./BaseUpdate";
export declare class Update2 extends BaseUpdate {
    protected readonly _version: number;
    protected readonly _description: string;
    run(): Promise<void>;
}
