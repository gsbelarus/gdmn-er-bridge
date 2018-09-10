import { DDLHelper } from "../builder/DDLHelper";
import { BaseSimpleUpdate } from "./BaseSimpleUpdate";
export declare class Update5 extends BaseSimpleUpdate {
    protected _version: number;
    protected _description: string;
    protected internalRun(ddlHelper: DDLHelper): Promise<void>;
}
