import { DBStructure, ATransaction, AConnection } from "gdmn-db";
import * as erm from 'gdmn-orm';
export declare function erExport(dbs: DBStructure, connection: AConnection, transaction: ATransaction, erModel: erm.ERModel): Promise<erm.ERModel>;
