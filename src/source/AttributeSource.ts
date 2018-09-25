import {Attribute, Entity, IAttributeSource} from "gdmn-orm";
import {Transaction} from "./Transaction";

export class AttributeSource implements IAttributeSource {

  public async init(obj: Attribute): Promise<Attribute> {
    return obj;
  }

  public async create<T extends Attribute>(transaction: Transaction, parent: Entity, obj: T): Promise<T> {
    const builder = await transaction.getBuilder();
    return (await builder.entityBuilder.addAttribute(parent, obj)) as T;
  }

  public async delete(transaction: Transaction, parent: Entity, obj: Attribute): Promise<void> {
    const builder = await transaction.getBuilder();
    await builder.entityBuilder.removeAttribute(parent, obj);
  }
}
