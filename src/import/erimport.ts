import {AConnection, INamedParams} from "gdmn-db";
import {
  Attribute,
  ERModel,
  isBlobAttribute,
  isBooleanAttribute,
  isDateAttribute,
  isEnumAttribute,
  isFloatAttribute,
  isIntegerAttribute,
  isNumberAttribute,
  isNumericAttribute,
  isScalarAttribute,
  isSequenceAttribute,
  isStringAttribute,
  isTimeAttribute,
  isTimeStampAttribute,
  ScalarAttribute
} from "gdmn-orm";
import {date2Str, dateTime2Str, time2Str} from "../util";
import {createATStructure} from "./atdata";
import {createDocStructure} from "./document";
import {createDomains} from "./domains";

export async function erImport(connection: AConnection, erModel: ERModel): Promise<void> {
  await AConnection.executeTransaction({
    connection,
    callback: async (transaction) => {
      await createDomains(connection, transaction);
      await createATStructure(connection, transaction);
      await createDocStructure(connection, transaction);
    }
  });

  await AConnection.executeTransaction({
    connection,
    callback: async (transaction) => {
      // create sequences
      for (const sequence of Object.values(erModel.sequencies)) {
        const sequenceName = sequence.adapter ? (sequence.adapter as any).sequence : sequence.name;
        if (sequenceName !== "GD_G_UNIQUE") {
          await connection.execute(transaction, `CREATE SEQUENCE ${sequenceName}`);
          await connection.execute(transaction, `ALTER SEQUENCE ${sequenceName} RESTART WITH 0`);
        }
      }

      const atRelationsStatement = await connection.prepare(transaction, `
        INSERT INTO AT_RELATIONS (RELATIONNAME, LNAME, DESCRIPTION)
        VALUES (:tableName, :lName, :description)
      `);
      const atFieldsStatement = await connection.prepare(transaction, `
        INSERT INTO AT_FIELDS (FIELDNAME, LNAME, DESCRIPTION, NUMERATION)
        VALUES (:fieldName, :lName, :description, :numeration)
      `);
      const atRelFieldsStatement = await connection.prepare(transaction, `
        INSERT INTO AT_RELATION_FIELDS (FIELDNAME, RELATIONNAME, LNAME, DESCRIPTION)
        VALUES (:fieldName, :relationName, :lName, :description)
      `);
      try {
        for (const entity of Object.values(erModel.entities)) {
          const params: INamedParams = {};
          const tableName = entity.name;
          const fields = [];
          const attrs = Object.values(entity.attributes).filter((attr) => isScalarAttribute(attr));
          for (const attr of attrs) {
            const domainName = `DF_${entity.name}${attrs.indexOf(attr) + 1}`; // TODO possible name conflicts
            const numeration = isEnumAttribute(attr)
              ? attr.values.map(({value, lName}) => `${value}=${lName && lName.ru ? lName.ru.name : ""}`).join("#13#10")
              : undefined;
            await atFieldsStatement.execute({
              fieldName: domainName,
              lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
              description: attr.lName.ru ? attr.lName.ru.fullName : attr.name,
              numeration: numeration ? Buffer.from(numeration) : undefined
            });
            const sql = `CREATE DOMAIN ${domainName} AS ${getType(attr)}`.padEnd(62) +
              getDefaultValue(attr) +
              getNullFlag(attr) +
              getChecker(attr);
            console.debug(sql);

            await connection.execute(transaction, sql);
            fields.push(attr.name.padEnd(31) + " " + domainName);
          }
          const sql = `CREATE TABLE ${tableName} (\n  ` + fields.join(",\n  ") + `\n)`;
          console.debug(sql);
          await connection.execute(transaction, sql, params);
          const pk = entity.pk.map((pk) => pk.name);
          if (pk.length) {
            const pkSql = `ALTER TABLE ${tableName} ADD CONSTRAINT PK_${tableName} PRIMARY KEY (${pk.join(", ")})`;
            console.debug(pkSql);
            await connection.execute(transaction, pkSql);
          }

          await atRelationsStatement.execute({
            tableName,
            lName: entity.lName.ru ? entity.lName.ru.name : entity.name,
            description: entity.lName.ru ? entity.lName.ru.fullName : entity.name
          });

          for (const attr of Object.values(entity.attributes).filter((attr) => isScalarAttribute(attr))) {
            await atRelFieldsStatement.execute({
              fieldName: attr.name,
              relationName: tableName,
              lName: attr.lName.ru ? attr.lName.ru.name : attr.name,
              description: attr.lName.ru ? attr.lName.ru.fullName : attr.name
            });
          }
        }
      } finally {
        if (!atRelationsStatement.disposed) {
          await atRelationsStatement.dispose();
        }
        if (!atFieldsStatement.disposed) {
          await atFieldsStatement.dispose();
        }
        if (!atRelFieldsStatement.disposed) {
          await atRelFieldsStatement.dispose();
        }
      }
    }
  });
}

function getType(attr: ScalarAttribute): string {
  let expr = "";
  // TODO TimeIntervalAttribute
  if (isEnumAttribute(attr)) {
    expr = `VARCHAR(1)`;
  } else if (isDateAttribute(attr)) {
    expr = `DATE`;
  } else if (isTimeAttribute(attr)) {
    expr = `TIME`;
  } else if (isTimeStampAttribute(attr)) {
    expr = `TIMESTAMP`;
  } else if (isSequenceAttribute(attr)) {
    expr = `INTEGER`;
  } else if (isIntegerAttribute(attr)) {
    expr = `INTEGER`;
  } else if (isNumericAttribute(attr)) {
    expr = `NUMERIC(${attr.precision}, ${attr.scale})`;
  } else if (isFloatAttribute(attr)) {
    expr = `FLOAT`;
  } else if (isBooleanAttribute(attr)) {
    expr = `SMALLINT`;
  } else if (isStringAttribute(attr)) {
    expr = `VARCHAR(${attr.maxLength})`;
  } else if (isBlobAttribute(attr)) {
    expr = `BLOB`;
  } else {
    expr = `BLOB SUB_TYPE TEXT`;
  }
  return expr;
}

function getChecker(attr: ScalarAttribute): string {
  let expr = "";
  if (isNumberAttribute(attr)) {
    const minCond = attr.minValue !== undefined ? `VALUE >= ${val2Str(attr, attr.minValue)}` : undefined;
    const maxCond = attr.maxValue !== undefined ? `VALUE <= ${val2Str(attr, attr.maxValue)}` : undefined;
    if (minCond && maxCond) {
      expr = `CHECK(${minCond} AND ${maxCond})`;
    } else if (minCond) {
      expr = `CHECK(${minCond})`;
    } else if (maxCond) {
      expr = `CHECK(${maxCond})`;
    }
  } else if (isStringAttribute(attr)) {
    const minCond = attr.minLength !== undefined ? `CHAR_LENGTH(VALUE) >= ${attr.minLength}` : undefined;
    if (minCond) {
      expr = `CHECK(${minCond})`;
    }
  } else if (isEnumAttribute(attr)) {
    expr = `CHECK(VALUE IN (${attr.values.map((item) => `'${item.value}'`).join(", ")}))`;
  } else if (isBooleanAttribute(attr)) {
    expr = `CHECK(VALUE IN (0, 1))`;
  }
  return expr.padEnd(62);
}

function getNullFlag(attr: Attribute): string {
  let expr = "";
  if (attr.required) {
    expr = "NOT NULL";
  }
  return expr.padEnd(10);
}

function getDefaultValue(attr: any): string {
  let expr = "";
  if (attr.defaultValue !== undefined) {
    expr = `DEFAULT ${val2Str(attr, attr.defaultValue)}`;
  }
  return expr.padEnd(40);
}

function val2Str(attr: ScalarAttribute, value: any): string | undefined {
  if (isDateAttribute(attr)) {
    return date2Str(value);
  } else if (isTimeAttribute(attr)) {
    return time2Str(value);
  } else if (isTimeStampAttribute(attr)) {
    return dateTime2Str(value);
  } else if (isNumberAttribute(attr)) {
    return `${value}`;
  } else if (isStringAttribute(attr)) {
    return `'${value}'`;
  } else if (isBooleanAttribute(attr)) {
    return `${+value}`;
  } else if (isEnumAttribute(attr)) {
    return `'${value}'`;
  }
}
