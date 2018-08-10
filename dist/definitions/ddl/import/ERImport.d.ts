import { AConnection } from "gdmn-db";
import { Attribute, ERModel } from "gdmn-orm";
export declare class ERImport {
    private readonly _connection;
    private readonly _erModel;
    private _atHelper;
    private _ddlHelper;
    constructor(connection: AConnection, erModel: ERModel);
    static _getFieldName(attr: Attribute): string;
    execute(): Promise<void>;
    private _getDDLHelper;
    private _getATHelper;
    private _createERSchema;
    private _addUnique;
    private _addLinks;
    private _addEntity;
    private _bindATEntity;
    private _bindATAttr;
}
