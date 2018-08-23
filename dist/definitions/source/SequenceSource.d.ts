import { ERModel, ISequenceSource, Sequence } from "gdmn-orm";
import { Transaction } from "./Transaction";
export declare class SequenceSource implements ISequenceSource {
    init(obj: Sequence): Promise<Sequence>;
    create<T extends Sequence>(transaction: Transaction, _: ERModel, obj: T): Promise<T>;
    delete(transaction: Transaction, _: ERModel, obj: Sequence): Promise<void>;
}
