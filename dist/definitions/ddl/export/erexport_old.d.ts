import { AConnection, ATransaction, DBStructure } from "gdmn-db";
import { ERModel } from "gdmn-orm";
export declare function erexport_old(dbs: DBStructure, connection: AConnection, transaction: ATransaction, erModel: ERModel): Promise<ERModel>;
