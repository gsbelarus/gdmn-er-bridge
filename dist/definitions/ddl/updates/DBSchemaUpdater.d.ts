import { AConnection } from "gdmn-db";
import { BaseUpdate } from "./BaseUpdate";
export declare type UpdateConstructor = new (connection: AConnection) => BaseUpdate;
export declare class DBSchemaUpdater extends BaseUpdate {
    protected readonly _version: number;
    protected readonly _description: string;
    run(): Promise<void>;
    private _sort;
    private _verifyAmount;
}
