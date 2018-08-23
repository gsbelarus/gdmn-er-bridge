import { Attribute, Entity } from "gdmn-orm";
import { Builder } from "./Builder";
export declare class EntityBuilder extends Builder {
    addUnique(entity: Entity, attrs: Attribute[]): Promise<void>;
    addAttribute(entity: Entity, attr: Attribute): Promise<Attribute>;
    removeAttribute(_entity: Entity, _attribute: Attribute): Promise<void>;
}
