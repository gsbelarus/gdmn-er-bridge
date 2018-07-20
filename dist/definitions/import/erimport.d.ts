import { AConnection } from "gdmn-db";
import { ERModel } from "gdmn-orm";
export declare function erImport(connection: AConnection, erModel: ERModel): Promise<void>;
