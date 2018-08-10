import {AConnection, ATransaction} from "gdmn-db";
import {Prefix} from "./Prefix";
import {DDLUniqueGenerator} from "./DDLUniqueGenerator";

export interface IColumnsProps {
  notNull?: boolean;
  default?: string;
  check?: string;
}

export interface IFieldProps extends IColumnsProps {
  name: string;
  domain: string;
}

export interface IDomainProps extends IColumnsProps {
  type: string;
}

export interface IRelation {
  tableName: string;
  fieldName: string;
}

export class DDLHelper {

  private readonly _connection: AConnection;
  private readonly _transaction: ATransaction;

  private _ddlUniqueGen = new DDLUniqueGenerator();

  private _logs: string[] = [];

  constructor(connection: AConnection, transaction: ATransaction) {
    this._connection = connection;
    this._transaction = transaction;
  }

  get logs(): string[] {
    return this._logs;
  }

  get ddlUniqueGen(): DDLUniqueGenerator {
    return this._ddlUniqueGen;
  }

  private static _getColumnProps(props: IColumnsProps): string {
    return (
      (props.default ? `DEFAULT ${props.default}` : " ").padEnd(40) +
      (props.notNull ? "NOT NULL" : " ").padEnd(10) +
      (props.check || "").padEnd(62)
    );
  }

  public async prepare(): Promise<void> {
    await this._ddlUniqueGen.prepare(this._connection, this._transaction);
  }

  public async dispose(): Promise<void> {
    await this._ddlUniqueGen.dispose();
  }

  public async addSequence(sequenceName: string): Promise<void> {
    await this._connection.execute(this._transaction, `CREATE SEQUENCE ${sequenceName}`);
    await this._connection.execute(this._transaction, `ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
  }

  public async addTable(tableName: string, scalarFields: IFieldProps[]): Promise<void> {
    const fields = scalarFields.map((item) => (
      `${item.name.padEnd(31)} ${item.domain.padEnd(31)} ${DDLHelper._getColumnProps(item)}`.trim()
    ));
    const sql = `CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`;
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }

  public async addColumns(tableName: string, scalarFields: IFieldProps[]): Promise<void> {
    for (const field of scalarFields) {
      const column = field.name.padEnd(31) + " " + field.domain.padEnd(31);
      const sql = `ALTER TABLE ${tableName} ADD ${column} ${DDLHelper._getColumnProps(field)}`.trim();
      this._logs.push(sql);
      await this._connection.execute(this._transaction, sql);
    }
  }

  public async addUnique(tableName: string, fieldNames: string[]): Promise<string>;
  public async addUnique(constraintName: string, tableName: string, fieldNames: string[]): Promise<string>;
  public async addUnique(constraintName: any, tableName: any, fieldNames?: any): Promise<string> {
    if (!fieldNames) {
      fieldNames = tableName;
      tableName = constraintName;
      constraintName = undefined;
    }
    if (!constraintName) {
      constraintName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.UNIQUE);
    }
    const sql = `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} UNIQUE (${fieldNames.join(", ")})`;
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
    return constraintName;
  }

  public async addPrimaryKey(tableName: string, fieldNames: string[]): Promise<string>;
  public async addPrimaryKey(constraintName: string, tableName: string, fieldNames: string[]): Promise<string>;
  public async addPrimaryKey(constraintName: any, tableName: any, fieldNames?: any): Promise<string> {
    if (!fieldNames) {
      fieldNames = tableName;
      tableName = constraintName;
      constraintName = undefined;
    }
    if (!constraintName) {
      constraintName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.PRIMARY_KEY);
    }
    const sql = `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} PRIMARY KEY (${fieldNames.join(", ")})`;
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
    return constraintName;
  }

  public async addForeignKey(from: IRelation, to: IRelation): Promise<string>;
  public async addForeignKey(constraintName: string, from: IRelation, to: IRelation): Promise<string>;
  public async addForeignKey(constraintName: any, from: any, to?: any): Promise<string> {
    if (!to) {
      to = from;
      from = constraintName;
      constraintName = undefined;
    }
    if (!constraintName) {
      constraintName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.FOREIGN_KEY);
    }
    const sql = `ALTER TABLE ${from.tableName} ADD CONSTRAINT ${constraintName} FOREIGN KEY (${from.fieldName}) ` +
      `REFERENCES ${to.tableName} (${to.fieldName})`;
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
    return constraintName;
  }

  public async addDomain(props: IDomainProps): Promise<string>;
  public async addDomain(domainName: string, pros: IDomainProps): Promise<string>;
  public async addDomain(domainName: any, props?: any): Promise<string> {
    if (!props) {
      props = domainName;
      domainName = undefined;
    }
    if (!domainName) {
      domainName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.DOMAIN);
    }
    const sql = `CREATE DOMAIN ${domainName.padEnd(31)} AS ${props.type.padEnd(31)}` +
      DDLHelper._getColumnProps(props);
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
    return domainName;
  }

  public async addAutoIncrementTrigger(tableName: string, fieldName: string, sequenceName: string): Promise<void>;
  public async addAutoIncrementTrigger(triggerName: string, tableName: string, fieldName: string, sequenceName: string): Promise<void>;
  public async addAutoIncrementTrigger(triggerName: any, tableName: any, fieldName: any, sequenceName?: any): Promise<void> {
    if (!sequenceName) {
      sequenceName = fieldName;
      fieldName = tableName;
      tableName = triggerName;
      triggerName = undefined;
    }
    if (!triggerName) {
      triggerName = Prefix.join(`${await this._ddlUniqueGen.next()}`, Prefix.TRIGGER_BI);
    }
    const sql = `
      CREATE TRIGGER ${triggerName} FOR ${tableName}
        ACTIVE BEFORE INSERT POSITION 0
      AS
      BEGIN
        IF (NEW.${fieldName} IS NULL) THEN NEW.${fieldName} = NEXT VALUE FOR ${sequenceName};
      END
    `;
    this._logs.push(sql);
    await this._connection.execute(this._transaction, sql);
  }
}
