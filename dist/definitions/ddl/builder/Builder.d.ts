import { AConnection, ATransaction, TExecutor } from "gdmn-db";
import { Attribute, Entity } from "gdmn-orm";
import { ATHelper } from "../ATHelper";
import { DDLHelper } from "../DDLHelper";
interface IATEntityOptions {
    relationName: string;
}
interface IATAttrOptions {
    relationName: string;
    fieldName: string;
    domainName: string;
    masterEntity?: Entity;
    crossTable?: string;
    crossTableKey?: number;
    crossField?: string;
}
export declare abstract class Builder {
    private _ddlHelper;
    private _atHelper;
    constructor();
    constructor(ddlHelper: DDLHelper, atHelper: ATHelper);
    readonly prepared: boolean;
    static executeSelf<T extends Builder, R>(connection: AConnection, transaction: ATransaction, selfReceiver: TExecutor<null, T>, callback: TExecutor<T, R>): Promise<R>;
    static _getTableName(entity: Entity): string;
    static _getFieldName(attr: Attribute): string;
    prepare(connection: AConnection, transaction: ATransaction): Promise<void>;
    dispose(): Promise<void>;
    protected _getDDLHelper(): DDLHelper;
    protected _getATHelper(): ATHelper;
    protected _insertATEntity(entity: Entity, options: IATEntityOptions): Promise<number>;
    protected _insertATAttr(attr: Attribute, options: IATAttrOptions): Promise<void>;
}
export {};
