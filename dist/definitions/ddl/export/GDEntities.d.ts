import { AConnection, ATransaction, DBStructure } from "gdmn-db";
import { ERModel, ICrossRelations } from "gdmn-orm";
import { IATLoadResult } from "./atData";
export declare class GDEntities {
    static CROSS_RELATIONS_ADAPTERS: ICrossRelations;
    static ABSTRACT_BASE_RELATIONS: {
        [name: string]: boolean;
    };
    private readonly _connection;
    private readonly _transaction;
    private readonly _erModel;
    private readonly _dbStructure;
    private _atResult;
    private _documentClasses;
    private _documentABC;
    constructor(connection: AConnection, transaction: ATransaction, erModel: ERModel, dbStructure: DBStructure);
    create(atResult: IATLoadResult): Promise<void>;
    private _createDocument;
    private _recursInherited;
    private _createEntity;
    private _getATResult;
}
