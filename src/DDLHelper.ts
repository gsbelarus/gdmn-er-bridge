import {AConnection, AStatement, ATransaction} from "gdmn-db";
import {G_UNIQUE_DDL_NAME} from "./import/createDefaultGenerators";
import {IDomainOptions} from "./import/DomainResolver";
import {Prefix} from "./import/Prefix";

export interface IScalarField {
  name: string;
  domain: string;
}

export class DDLHelper {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;

  private _nextUnique: AStatement | undefined;

  private _logs: string[] = [];

  constructor(connection: AConnection, transaction: ATransaction) {
    this._connection = connection;
    this._transaction = transaction;
  }

  get logs(): string[] {
    return this._logs;
  }

  public async prepare(): Promise<void> {
    this._nextUnique = await this._connection.prepare(this._transaction,
      `SELECT NEXT VALUE FOR ${Prefix.join(G_UNIQUE_DDL_NAME, Prefix.GDMN, Prefix.GENERATOR)} FROM RDB$DATABASE`);
  }

  public async dispose(): Promise<void> {
    if (this._nextUnique) {
      await this._nextUnique.dispose();
    }
  }

  public async addSequence(sequenceName: string): Promise<void> {
    await this._connection.execute(this._transaction, `CREATE SEQUENCE ${sequenceName}`);
    await this._connection.execute(this._transaction, `ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
  }

  public async addTable(tableName: string, scalarFields: IScalarField[]): Promise<void> {
    const fields = scalarFields.map((item) => `${item.name.padEnd(31)} ${item.domain}`);
    const sql = `CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`;
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }

  public async addPrimaryKey(tableName: string, fieldNames: string[]): Promise<void> {
    const sql = `ALTER TABLE ${tableName} ADD CONSTRAINT ${Prefix.join(tableName, Prefix.PK)} PRIMARY KEY (${fieldNames.join(", ")})`;
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }

  public async addScalarDomain(domainName: string, options: IDomainOptions): Promise<void> {
    const sql = `CREATE DOMAIN ${domainName} AS ${options.type}`.padEnd(62) +
      options.default.padEnd(40) +
      options.nullable.padEnd(10) +
      options.check.padEnd(62);
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }

  public async nextUnique(): Promise<number> {
    if (this._nextUnique) {
      const result = await this._nextUnique.executeReturning();
      return (await result.getAll())[0];
    } else {
      throw new Error("nextUnique is undefined");
    }
  }
}
