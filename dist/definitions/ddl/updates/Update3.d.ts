import { DDLHelper } from "../builder/DDLHelper";
import { BaseSimpleUpdate } from "./BaseSimpleUpdate";
export declare class Update3 extends BaseSimpleUpdate {
    protected readonly _version: number;
    protected readonly _description: string;
    protected internalRun(ddlHelper: DDLHelper): Promise<void>;
}
//# sourceMappingURL=Update3.d.ts.map