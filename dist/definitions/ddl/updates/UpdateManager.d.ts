import { AConnection } from "gdmn-db";
import { BaseUpdate } from "./BaseUpdate";
export declare type UpdateConstructor = new (connection: AConnection) => BaseUpdate;
export declare class UpdateManager {
    static readonly CURRENT_DATABASE_VERSION: number;
    private readonly _updatesConstructors;
    updateDatabase(connection: AConnection): Promise<void>;
    private sort;
    private verifyAmount;
    private _getDBVersion;
}
