import { AConnection, ATransaction } from "gdmn-db";
import { Entity, Sequence } from "gdmn-orm";
import { Builder } from "./Builder";
import { EntityBuilder } from "./EntityBuilder";
export declare class ERModelBuilder extends Builder {
    private _entityBuilder;
    readonly entityBuilder: EntityBuilder;
    prepare(connection: AConnection, transaction: ATransaction): Promise<void>;
    addSequence(sequence: Sequence): Promise<Sequence>;
    removeSequence(_sequence: Sequence): Promise<void>;
    addEntity(entity: Entity): Promise<Entity>;
    removeEntity(_entity: Entity): Promise<void>;
}
//# sourceMappingURL=ERModelBuilder.d.ts.map