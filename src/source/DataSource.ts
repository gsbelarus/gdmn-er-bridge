import {AConnection, DBStructure} from "gdmn-db";
import {EntityQuery, ERModel, IDataSource, IQueryResponse, ISequenceSource, Sequence} from "gdmn-orm";
import {SelectBuilder} from "../crud/query/SelectBuilder";
import {Constants} from "../ddl/Constants";
import {DBSchemaUpdater} from "../ddl/updates/DBSchemaUpdater";
import {EntitySource} from "./EntitySource";
import {SequenceSource} from "./SequenceSource";
import {Transaction} from "./Transaction";

export class DataSource implements IDataSource {

  private readonly _connection: AConnection;
  private readonly _dbStructure: DBStructure;
  private _globalSequence: Sequence | undefined;

  constructor(connection: AConnection, dbStructure: DBStructure) {
    this._connection = connection;
    this._dbStructure = dbStructure;
  }

  public async init(obj: ERModel): Promise<ERModel> {
    await new DBSchemaUpdater(this._connection).run();

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

  public async query(transaction: Transaction, query: EntityQuery): Promise<IQueryResponse> {
    const {sql, params, fieldAliases} = new SelectBuilder(this._dbStructure, query).build();

    const data = await AConnection.executeQueryResultSet({
      connection: this._connection,
      transaction: transaction.dbTransaction,
      sql,
      params,
      callback: async (resultSet) => {
        const result = [];
        while (await resultSet.next()) {
          const row: { [key: string]: any } = {};
          for (let i = 0; i < resultSet.metadata.columnCount; i++) {
            // TODO binary blob support
            row[resultSet.metadata.getColumnLabel(i)] = await resultSet.getAny(i);
          }
          result.push(row);
        }
        return result;
      }
    });

    const aliases = [];
    for (const [key, value] of fieldAliases) {
      const link = query.link.deepFindLinkByField(key);
      if (!link) {
        throw new Error("Field not found");
      }
      aliases.push({
        alias: link.alias,
        attribute: key.attribute.name,
        values: value
      });
    }

    return {
      data,
      aliases,
      info: {
        select: sql,
        params
      }
    };
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
