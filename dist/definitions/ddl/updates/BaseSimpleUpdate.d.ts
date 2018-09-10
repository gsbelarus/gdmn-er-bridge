import { DDLHelper } from "../builder/DDLHelper";
import { BaseUpdate } from "./BaseUpdate";
export declare abstract class BaseSimpleUpdate extends BaseUpdate {
    run(): Promise<void>;
    protected abstract internalRun(ddlHelper: DDLHelper): Promise<void>;
}
