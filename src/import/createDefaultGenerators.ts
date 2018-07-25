import {AConnection, ATransaction} from "gdmn-db";
import {Prefix} from "./Prefix";

export const G_UNIQUE_NAME = "UNIQUE";
export const G_UNIQUE_DDL_NAME = "DDL";

export async function createDefaultGenerators(connection: AConnection, transaction: ATransaction): Promise<void> {
  await connection.execute(transaction,
    `CREATE SEQUENCE ${Prefix.join(G_UNIQUE_NAME, Prefix.GDMN, Prefix.GENERATOR)}`);
  await connection.execute(transaction,
    `ALTER SEQUENCE ${Prefix.join(G_UNIQUE_NAME, Prefix.GDMN, Prefix.GENERATOR)} RESTART WITH 0`);

  await connection.execute(transaction,
    `CREATE SEQUENCE ${Prefix.join(G_UNIQUE_DDL_NAME, Prefix.GDMN, Prefix.GENERATOR)}`);
  await connection.execute(transaction,
    `ALTER SEQUENCE ${Prefix.join(G_UNIQUE_DDL_NAME, Prefix.GDMN, Prefix.GENERATOR)} RESTART WITH 0`);
}
