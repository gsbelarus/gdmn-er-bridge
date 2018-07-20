import {AConnection, ATransaction} from "gdmn-db";

export async function createATStructure(connection: AConnection, transaction: ATransaction): Promise<void> {
  await connection.execute(transaction, `CREATE SEQUENCE GD_G_UNIQUE`);
  await connection.execute(transaction, `ALTER SEQUENCE GD_G_UNIQUE RESTART WITH 0`);
  // -----------------------------------------------------------AT_FIELDS
  await connection.execute(transaction, `
    CREATE TABLE AT_FIELDS (
      ID                  DINTKEY                                 PRIMARY KEY,
      FIELDNAME           DFIELDNAME          NOT NULL,
      LNAME               DNAME,
      DESCRIPTION         DTEXT180,
      REFTABLE            DTABLENAME,
      REFCONDITION        DTEXT255,
      SETTABLE            DTABLENAME,
      SETLISTFIELD        DFIELDNAME,
      SETCONDITION        DTEXT255,
      NUMERATION          DNUMERATIONBLOB
    )
  `);
  await connection.execute(transaction, `
    CREATE TRIGGER AT_BI_FIELDS FOR AT_FIELDS
    ACTIVE BEFORE INSERT POSITION 0
    AS
    BEGIN
      IF (NEW.ID IS NULL) THEN NEW.ID = GEN_ID(GD_G_UNIQUE, 1);
    END
  `);
  // -----------------------------------------------------------AT_RELATIONS
  await connection.execute(transaction, `
    CREATE TABLE AT_RELATIONS (
      ID                  DINTKEY                                 PRIMARY KEY,
      RELATIONNAME        DTABLENAME          NOT NULL,
      LNAME               DNAME,
      DESCRIPTION         DTEXT180,
      SEMCATEGORY         DTEXT60
    )
  `);
  await connection.execute(transaction, `
    CREATE TRIGGER AT_BI_RELATIONS FOR AT_RELATIONS
    ACTIVE BEFORE INSERT POSITION 0
    AS
    BEGIN
      IF (NEW.ID IS NULL) THEN NEW.ID = GEN_ID(GD_G_UNIQUE, 1);
    END
  `);
  // -----------------------------------------------------------AT_RELATION_FIELDS
  await connection.execute(transaction, `
    CREATE TABLE AT_RELATION_FIELDS (
      ID                  DINTKEY                                 PRIMARY KEY,
      FIELDNAME           DFIELDNAME          NOT NULL,
      RELATIONNAME        DTABLENAME          NOT NULL,
      FIELDSOURCE         DFIELDNAME,
      LNAME               DNAME,
      DESCRIPTION         DTEXT180,
      SEMCATEGORY         DTEXT60,
      CROSSTABLE          DTABLENAME,
      CROSSFIELD          DFIELDNAME
    )
  `);
  await connection.execute(transaction, `
    CREATE TRIGGER AT_BI_RELATION_FIELDS FOR AT_RELATION_FIELDS
    ACTIVE BEFORE INSERT POSITION 0
    AS
    BEGIN
      IF (NEW.ID IS NULL) THEN NEW.ID = GEN_ID(GD_G_UNIQUE, 1);
    END
  `);
}
