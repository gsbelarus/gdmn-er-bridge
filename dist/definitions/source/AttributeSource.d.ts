import { Attribute, Entity, IAttributeSource } from "gdmn-orm";
import { Transaction } from "./Transaction";
export declare class AttributeSource implements IAttributeSource {
    init(obj: Attribute): Promise<Attribute>;
    create<T extends Attribute>(transaction: Transaction, parent: Entity, obj: T): Promise<T>;
    delete(transaction: Transaction, parent: Entity, obj: Attribute): Promise<void>;
}
