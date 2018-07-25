import {AConnection, ATransaction} from "gdmn-db";

export async function createDefaultDomains(connection: AConnection, transaction: ATransaction): Promise<void> {
  await connection.execute(transaction, `
    CREATE DOMAIN DINTKEY AS INTEGER
	    CHECK (VALUE > 0) NOT NULL
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DPARENT AS INTEGER
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DFOREIGNKEY AS INTEGER
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DLB AS INTEGER
	    DEFAULT 1 NOT NULL
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DRB AS INTEGER
	    DEFAULT 2 NOT NULL
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DRUID AS VARCHAR(21) 
      NOT NULL
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DBOOLEAN AS SMALLINT
	    DEFAULT 0
	    CHECK (VALUE IN (0, 1))
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DTABLENAME AS VARCHAR(31)
	    CHECK (VALUE > '')
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DFIELDNAME AS VARCHAR (31)
      CHECK (VALUE > '')
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DTEXT255 AS VARCHAR(255)
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DTEXT180 AS VARCHAR(180)
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DTEXT60 AS VARCHAR(60)
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DNAME AS VARCHAR(60) 
      NOT NULL
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DDOCUMENTTYPE AS VARCHAR(1)
	    CHECK ((VALUE = 'B') OR (VALUE = 'D'))
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DCLASSNAME AS VARCHAR(40)
  `);
  await connection.execute(transaction, `
    CREATE DOMAIN DNUMERATIONBLOB AS BLOB SUB_TYPE -1 
      SEGMENT SIZE 256
  `);
}
