import { ERModel, ISequenceSource, Sequence } from "gdmn-orm";
import { DataSource } from "./DataSource";
import { Transaction } from "./Transaction";
export declare class SequenceSource implements ISequenceSource {
    private readonly _dataSource;
    constructor(dataSource: DataSource);
    init(obj: Sequence): Promise<Sequence>;
    create<T extends Sequence>(_: ERModel, obj: T, transaction?: Transaction): Promise<T>;
    delete(_: ERModel, obj: Sequence, transaction?: Transaction): Promise<void>;
}
//# sourceMappingURL=SequenceSource.d.ts.map