import { Attribute, Entity, ERModel, IAttributeSource, IEntitySource } from "gdmn-orm";
import { DataSource } from "./DataSource";
import { Transaction } from "./Transaction";
export declare class EntitySource implements IEntitySource {
    private readonly _dataSource;
    constructor(dataSource: DataSource);
    init(obj: Entity): Promise<Entity>;
    create<T extends Entity>(_: ERModel, obj: T, transaction?: Transaction): Promise<T>;
    delete(_: ERModel, obj: Entity, transaction?: Transaction): Promise<void>;
    addUnique(entity: Entity, attrs: Attribute[], transaction?: Transaction): Promise<void>;
    removeUnique(): Promise<void>;
    getAttributeSource(): IAttributeSource;
}
//# sourceMappingURL=EntitySource.d.ts.map