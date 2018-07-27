import {AConnection, ATransaction} from "gdmn-db";
import {Prefix} from "../Prefix";

export interface IScalarField {
  name: string;
  domain: string;
}

export interface IDomainOptions {
  type: string;
  default?: string;
  notNull?: boolean;
  check?: string;
}

export class DDLHelper {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;

  private _logs: string[] = [];

  constructor(connection: AConnection, transaction: ATransaction) {
    this._connection = connection;
    this._transaction = transaction;
  }

  get logs(): string[] {
    return this._logs;
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
    const sql = `CREATE DOMAIN ${domainName.padEnd(31)} AS ${options.type.padEnd(31)}` +
      (options.default ? `DEFAULT ${options.default}` : "").padEnd(40) +
      (options.notNull ? "NOT NULL" : "").padEnd(10) +
      (options.check || "").padEnd(62);
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }
}
