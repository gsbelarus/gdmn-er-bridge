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
    private static _tableName;
    private static _fieldName;
    execute(): Promise<void>;
    _prepareStatements(transaction: ATransaction): Promise<void>;
    _disposeStatements(): Promise<void>;
    private _createDefaultSchema;
    private _createERSchema;
    private _addEntity;
    private _addScalarDomain;
    private _bindATEntity;
    private _bindATAttr;
}
