import { AConnection, ATransaction, DBStructure } from "gdmn-db";
import { ERModel } from "gdmn-orm";
export declare class ERExport {
    private readonly _connection;
    private readonly _transaction;
    private readonly _dbStructure;
    private readonly _erModel;
    private readonly _gdEntities;
    private _atResult;
    constructor(connection: AConnection, transaction: ATransaction, dbStructure: DBStructure, erModel: ERModel);
    execute(): Promise<ERModel>;
    private _getATResult;
    private _createEntities;
    private _createEntity;
    private _createAttributes;
    private _createDetailAttributes;
    /**
     * Looking for cross-tables and construct set attributes.
     *
     * 1. Cross tables are those whose PK consists of minimum 2 fields.
     * 2. First field of cross table PK must be a FK referencing owner table.
     * 3. Second field of cross table PK must be a FK referencing reference table.
     * 4. Owner in this context is an Entity(s) a Set attribute belongs to.
     * 5. Reference in this context is an Entity(s) a Set attribute contains objects of which type.
     */
    private _createSetAttributes;
    private _createAttribute;
    private _findEntities;
}
//# sourceMappingURL=ERExport.d.ts.map