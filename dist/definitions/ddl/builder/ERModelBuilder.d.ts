import { AConnection, ATransaction } from "gdmn-db";
import { Entity, ERModel, Sequence } from "gdmn-orm";
import { Builder } from "./Builder";
import { EntityBuilder } from "./EntityBuilder";
export declare class ERModelBuilder extends Builder {
    private _entityBuilder;
    readonly entityBuilder: EntityBuilder;
    prepare(connection: AConnection, transaction: ATransaction): Promise<void>;
    initERModel(erModel?: ERModel): Promise<ERModel>;
    addSequence(erModel: ERModel, sequence: Sequence): Promise<Sequence>;
    removeSequence(_erModel: ERModel, _sequence: Sequence): Promise<void>;
    addEntity(erModel: ERModel, entity: Entity): Promise<Entity>;
    removeEntity(_erModel: ERModel, _entity: Entity): Promise<void>;
}
