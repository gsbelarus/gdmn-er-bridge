import { Attribute, Entity, ERModel, IAttributeSource, IEntitySource, Sequence } from "gdmn-orm";
import { Transaction } from "./Transaction";
export declare class EntitySource implements IEntitySource {
    private readonly _globalSequence;
    constructor(globalSequence: Sequence);
    init(obj: Entity): Promise<Entity>;
    create<T extends Entity>(transaction: Transaction, _: ERModel, obj: T): Promise<T>;
    delete(transaction: Transaction, _: ERModel, obj: Entity): Promise<void>;
    addUnique(transaction: Transaction, entity: Entity, attrs: Attribute[]): Promise<void>;
    removeUnique(): Promise<void>;
    getAttributeSource(): IAttributeSource;
}
