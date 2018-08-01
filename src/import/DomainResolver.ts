import {
  Attribute,
  isBlobAttribute,
  isBooleanAttribute,
  isDateAttribute,
  isEntityAttribute,
  isEnumAttribute,
  isFloatAttribute,
  isIntegerAttribute,
  isNumberAttribute,
  isNumericAttribute,
  isSequenceAttribute,
  isStringAttribute,
  isTimeAttribute,
  isTimeStampAttribute,
  MAX_16BIT_INT,
  MAX_32BIT_INT,
  MAX_64BIT_INT,
  MIN_16BIT_INT,
  MIN_32BIT_INT,
  MIN_64BIT_INT,
  ScalarAttribute
} from "gdmn-orm";
import {IDomainProps} from "../ddl/DDLHelper";
import {date2Str, dateTime2Str, time2Str} from "../util";

export class DomainResolver {

  public static resolve(attr: Attribute): IDomainProps {
    return {
      type: DomainResolver._getType(attr),
      default: DomainResolver._getDefaultValue(attr),
      notNull: attr.required,
      check: DomainResolver._getChecker(attr)
    };
  }

  private static _getType(attr: Attribute): string {
    let expr = "";
    // TODO TimeIntervalAttribute
    if (isEntityAttribute(attr)) {
      expr = `INTEGER`;
    } else if (isEnumAttribute(attr)) {
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
      expr = DomainResolver._getIntTypeByRange(attr.minValue, attr.maxValue);
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

  private static _getChecker(attr: Attribute): string {
    let expr = "";
    if (isNumberAttribute(attr)) {
      const minCond = attr.minValue !== undefined ? DomainResolver._val2Str(attr, attr.minValue) : undefined;
      const maxCond = attr.maxValue !== undefined ? DomainResolver._val2Str(attr, attr.maxValue) : undefined;
      if (minCond && maxCond) {
        expr = `CHECK(VALUE BETWEEN ${minCond} AND ${maxCond})`;
      } else if (minCond) {
        expr = `CHECK(VALUE >= ${minCond})`;
      } else if (maxCond) {
        expr = `CHECK(VALUE <= ${maxCond})`;
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
    return expr;
  }

  private static _getDefaultValue(attr: any): string {
    let expr = "";
    if (attr.defaultValue !== undefined) {
      expr = `${DomainResolver._val2Str(attr, attr.defaultValue)}`;
    }
    return expr;
  }

  private static _val2Str(attr: ScalarAttribute, value: any): string | undefined {
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

  private static _getIntTypeByRange(min: number = MIN_32BIT_INT, max: number = MAX_32BIT_INT): string {
    const minR = [MIN_16BIT_INT, MIN_32BIT_INT, MIN_64BIT_INT];
    const maxR = [MAX_16BIT_INT, MAX_32BIT_INT, MAX_64BIT_INT];

    const start = minR.find((b) => b <= min);
    const end = maxR.find((b) => b >= max);
    if (start === undefined) throw new Error("Out of range");
    if (end === undefined) throw new Error("Out of range");

    switch (minR[Math.max(minR.indexOf(start), maxR.indexOf(end))]) {
      case MIN_64BIT_INT:
        return "BIGINT";
      case MIN_16BIT_INT:
        return "SMALLINT";
      case MIN_32BIT_INT:
      default:
        return "INTEGER";
    }
  }
}
