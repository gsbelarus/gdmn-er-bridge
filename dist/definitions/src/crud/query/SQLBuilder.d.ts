import { DBStructure, INamedParams } from "gdmn-db";
import { EntityQuery, EntityQueryField, ERModel, IEntityQueryInspector } from "gdmn-orm";
export interface IEntityQueryFieldAlias {
    [attrName: string]: string;
}
export declare class SQLBuilder {
    private readonly _erModel;
    private readonly _dbStructure;
    private readonly _query;
    private _linkAliases;
    private _fieldAliases;
    private _params;
    constructor(erModel: ERModel, dbStructure: DBStructure, query: string);
    constructor(erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector);
    constructor(erModel: ERModel, dbStructure: DBStructure, query: EntityQuery);
    private static _arrayJoinWithBracket;
    private static _getAttrAdapter;
    private static _getPrimaryAttribute;
    private static _checkInAttrMap;
    build(): {
        sql: string;
        params: INamedParams;
        fieldAliases: Map<EntityQueryField, IEntityQueryFieldAlias>;
    };
    private _createAliases;
    private _getSelect;
    private _makeFields;
    private _makeFrom;
    private _makeJoin;
    private _makeWhereLinkConditions;
    private _makeWhereConditions;
    private _makeOrder;
    private _getPrimaryName;
    private _getTableAlias;
    private _getFieldAlias;
    private _deepFindLinkByAlias;
    private _isExistInQuery;
    private _addToParams;
    private _clearVariables;
}
