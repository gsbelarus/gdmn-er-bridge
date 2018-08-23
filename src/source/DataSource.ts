import {AConnection} from "gdmn-db";
import {ERModel, IDataSource, ISequenceSource, Sequence} from "gdmn-orm";
import {Constants} from "../ddl/Constants";
import {UpdateManager} from "../ddl/updates/UpdateManager";
import {EntitySource} from "./EntitySource";
import {SequenceSource} from "./SequenceSource";
import {Transaction} from "./Transaction";

export class DataSource implements IDataSource {

  private readonly _connection: AConnection;
  private _globalSequence: Sequence | undefined;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  public async init(obj: ERModel): Promise<ERModel> {
    await new UpdateManager().updateDatabase(this._connection);

    if (!Object.values(obj.sequencies).some((seq) => seq.name == Constants.GLOBAL_GENERATOR)) {
      obj.addSequence(new Sequence({name: Constants.GLOBAL_GENERATOR}));
    }
    this._globalSequence = obj.sequence(Constants.GLOBAL_GENERATOR);
    return obj;
  }

  public async startTransaction(): Promise<Transaction> {
    const dbTransaction = await this._connection.startTransaction();
    return new Transaction(this._connection, dbTransaction);
  }

  public async commitTransaction(transaction: Transaction): Promise<void> {
    return await transaction.commit();
  }

  public async rollbackTransaction(transaction: Transaction): Promise<void> {
    return await transaction.rollback();
  }

  getEntitySource(): EntitySource {
    if (!this._globalSequence) {
      throw new Error("globalSequence is undefined");
    }
    return new EntitySource(this._globalSequence);
  }

  getSequenceSource(): ISequenceSource {
    return new SequenceSource();
  }
}
