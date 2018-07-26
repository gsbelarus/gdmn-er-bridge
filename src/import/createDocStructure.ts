import {AConnection, ATransaction} from "gdmn-db";

export async function createDocStructure(connection: AConnection, transaction: ATransaction): Promise<void> {
  await connection.execute(transaction, `
    CREATE TABLE GD_DOCUMENTTYPE (
      ID                  DINTKEY                                 PRIMARY KEY,
      RUID                DRUID,
      DOCUMENTTYPE        DDOCUMENTTYPE       DEFAULT 'D',
      NAME                DNAME,
      CLASSNAME           DCLASSNAME,
      PARENT              DPARENT,
      LB                  DLB,
      RB                  DRB,
      HEADERRELKEY        DFOREIGNKEY,
      LINERELKEY          DFOREIGNKEY
    )
  `);
  await connection.execute(transaction, `
    CREATE TRIGGER GD_BI_DOCUMENTTYPE FOR GD_DOCUMENTTYPE
    ACTIVE BEFORE INSERT POSITION 0
    AS
    BEGIN
      IF (NEW.ID IS NULL) THEN NEW.ID = GEN_ID(GD_G_UNIQUE, 1);
    END
  `);
}