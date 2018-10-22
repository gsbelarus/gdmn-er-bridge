import { Attribute, Entity, IAttributeSource } from "gdmn-orm";
import { DataSource } from "./DataSource";
import { Transaction } from "./Transaction";
export declare class AttributeSource implements IAttributeSource {
    private readonly _dataSource;
    constructor(dataSource: DataSource);
    init(obj: Attribute): Promise<Attribute>;
    create<T extends Attribute>(parent: Entity, obj: T, transaction?: Transaction): Promise<T>;
    delete(parent: Entity, obj: Attribute, transaction?: Transaction): Promise<void>;
}
//# sourceMappingURL=AttributeSource.d.ts.map