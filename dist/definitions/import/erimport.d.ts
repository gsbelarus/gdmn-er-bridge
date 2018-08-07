import { AConnection } from "gdmn-db";
import { ERModel, ScalarAttribute } from "gdmn-orm";
export declare class ERImport {
    private readonly _connection;
    private readonly _erModel;
    private _atHelper;
    private _ddlHelper;
    constructor(connection: AConnection, erModel: ERModel);
    static _getScalarFieldName(attr: ScalarAttribute): string;
    execute(): Promise<void>;
    private _getDDLHelper;
    private _getATHelper;
    private _createERSchema;
    private _addLinks;
    private _addEntity;
    private _bindATEntity;
    private _bindATAttr;
}
