import {
  Attribute,
  Entity,
  EntityAttribute,
  ERModel,
  IAttributeSource,
  IEntitySource,
  Sequence,
  SequenceAttribute
} from "gdmn-orm";
import {Builder} from "../ddl/builder/Builder";
import {Constants} from "../ddl/Constants";
import {AttributeSource} from "./AttributeSource";
import {Transaction} from "./Transaction";

export class EntitySource implements IEntitySource {

  private readonly _globalSequence: Sequence;

  constructor(globalSequence: Sequence) {
    this._globalSequence = globalSequence;
  }

  public async init(obj: Entity): Promise<Entity> {
    if (obj.parent && !obj.hasOwnAttribute(Constants.DEFAULT_INHERITED_KEY_NAME)) {
      obj.add(new EntityAttribute({
        name: Constants.DEFAULT_INHERITED_KEY_NAME,
        required: true,
        lName: {ru: {name: "Родитель"}},
        entities: [obj.parent]
      }));

    } else if (!obj.hasOwnAttribute(Constants.DEFAULT_ID_NAME)) {
      obj.add(new SequenceAttribute({
        name: Constants.DEFAULT_ID_NAME,
        lName: {ru: {name: "Идентификатор"}},
        sequence: this._globalSequence,
        adapter: {
          relation: Builder._getOwnRelationName(obj),
          field: Constants.DEFAULT_ID_NAME
        }
      }));
    }
    return obj;
  }

  public async create<T extends Entity>(transaction: Transaction, _: ERModel, obj: T): Promise<T> {
    const builder = await transaction.getBuilder();
    return (await builder.addEntity(obj)) as T;
  }

  public async delete(transaction: Transaction, _: ERModel, obj: Entity): Promise<void> {
    const builder = await transaction.getBuilder();
    await builder.removeEntity(obj);
  }

  public async addUnique(transaction: Transaction, entity: Entity, attrs: Attribute[]): Promise<void> {
    const builder = await transaction.getBuilder();
    return await builder.entityBuilder.addUnique(entity, attrs);
  }

  public async removeUnique(): Promise<void> {
    throw new Error("Unsupported yet");
  }

  getAttributeSource(): IAttributeSource {
    return new AttributeSource();
  }
}
