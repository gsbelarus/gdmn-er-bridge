import { AConnection, ATransaction } from "gdmn-db";
import { ERModel } from "gdmn-orm";
export declare class ERImport {
    private readonly _connection;
    private readonly _erModel;
    private _createATField;
    private _createATRelation;
    private _createATRelationField;
    private _ddlHelper;
    constructor(connection: AConnection, erModel: ERModel);
    execute(): Promise<void>;
    _prepareStatements(transaction: ATransaction): Promise<void>;
    _disposeStatements(): Promise<void>;
    private _getDDLHelper;
    private _createERSchema;
    private _addLinks;
    private _addEntity;
    private _bindATEntity;
    private _bindATAttr;
}
