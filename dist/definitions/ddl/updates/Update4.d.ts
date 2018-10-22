import { DDLHelper } from "../builder/DDLHelper";
import { BaseSimpleUpdate } from "./BaseSimpleUpdate";
export declare class Update4 extends BaseSimpleUpdate {
    protected readonly _version: number;
    protected readonly _description: string;
    protected internalRun(ddlHelper: DDLHelper): Promise<void>;
}
//# sourceMappingURL=Update4.d.ts.map