import { AConnection, ATransaction, DBStructure } from "gdmn-db";
import { ERModel } from "gdmn-orm";
export declare function erExport(dbs: DBStructure, connection: AConnection, transaction: ATransaction, erModel: ERModel): Promise<ERModel>;
