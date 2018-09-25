import {ERModel, ISequenceSource, Sequence} from "gdmn-orm";
import {Transaction} from "./Transaction";

export class SequenceSource implements ISequenceSource {

  public async init(obj: Sequence): Promise<Sequence> {
    return obj;
  }

  public async create<T extends Sequence>(transaction: Transaction, _: ERModel, obj: T): Promise<T> {
    const builder = await transaction.getBuilder();
    return (await builder.addSequence(obj)) as T;
  }

  public async delete(transaction: Transaction, _: ERModel, obj: Sequence): Promise<void> {
    const builder = await transaction.getBuilder();
    await builder.removeSequence(obj);
  }
}
