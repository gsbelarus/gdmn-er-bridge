import { AConnection } from "gdmn-db";
import { Attribute, Entity, ERModel, IAttributeSource, IEntitySource } from "gdmn-orm";
import { Transaction } from "./Transaction";
export declare class EntitySource implements IEntitySource {
    private readonly _connection;
    constructor(connection: AConnection);
    init(obj: Entity): Promise<Entity>;
    create<T extends Entity>(transaction: Transaction, parent: ERModel, obj: T): Promise<T>;
    delete(): Promise<void>;
    addUnique(transaction: Transaction, attrs: Attribute[]): Promise<void>;
    removeUnique(transaction: Transaction, attrs: Attribute[]): Promise<void>;
    getAttributeSource(): IAttributeSource;
}
