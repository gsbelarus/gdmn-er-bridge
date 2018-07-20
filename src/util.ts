import {ContextVariables} from "gdmn-orm";
import moment from "moment";

const TIME_TEMPLATE = "HH:mm:ss.SSS";
const DATE_TEMPLATE = "DD.MM.YYYY";
const TIMESTAMP_TEMPLATE = "DD.MM.YYYY HH:mm:ss.SSS";

export interface IRange<T> {
  minValue: T | undefined;
  maxValue: T | undefined;
}

export function isCheckForBoolean(validationSource: string | null): boolean {
  const booleanCheckTemplate = /^CHECK ?\((VALUE IN \(0, ?1\))\)$/i;
  return !!validationSource && booleanCheckTemplate.test(validationSource);
}

export function check2Enum(validationSource: string | null): string [] {
  const enumValues = [];
  if (validationSource) {
    const reValueIn = /CHECK\s*\((\(VALUE IS NULL\) OR )?(\(?VALUE\s+IN\s*\(\s*){1}((?:\'[A-Z0-9]\'(?:\,\s*)?)+)\)?\)\)/i;
    let match;
    if (match = reValueIn.exec(validationSource)) {
      const reEnumValue = /\'([A-Z0-9]{1})\'/g;
      let enumValue;
      while (enumValue = reEnumValue.exec(match[3])) {
        enumValues.push(enumValue[1]);
      }
    }
  }
  return enumValues;
}

export function check2StrMin(validationSource: string | null): number | undefined {
  if (validationSource) {
    switch (validationSource) {
      case "CHECK (VALUE > '')":
      case "CHECK ((VALUE IS NULL) OR (VALUE > ''))":
        return 1;
      default:
        const minTemplate = /^CHECK ?\((CHAR_LENGTH\(VALUE\) ?>= ?(.+))\)$/i;
        if (minTemplate.test(validationSource)) {
          return Number(validationSource.replace(minTemplate, "$2"));
        }
        console.warn(`Not processed: ${validationSource}`);
        break;
    }
  }
}

export function check2NumberRange(validationSource: string | null,
                                  rangeLimit?: { min: number, max: number }): IRange<number> {
  const {min, max} = rangeLimit || {min: undefined, max: undefined};
  const range = checkRange(validationSource);

  let minValue = range.min !== undefined ? Number.parseFloat(range.min) : min;
  let maxValue = range.max !== undefined ? Number.parseFloat(range.max) : max;
  if (minValue !== undefined && min !== undefined && minValue < min) {
    minValue = min;
  }
  if (maxValue !== undefined && max !== undefined && maxValue > max) {
    maxValue = max;
  }
  return {minValue, maxValue};
}

export function check2TimestampRange(validationSource: string | null): IRange<Date> {
  const range = checkRange(validationSource);
  const minDate = moment(range.min, TIMESTAMP_TEMPLATE);
  const maxDate = moment(range.max, TIMESTAMP_TEMPLATE);
  return {
    minValue: minDate.isValid() ? minDate.toDate() : undefined,
    maxValue: maxDate.isValid() ? maxDate.toDate() : undefined
  };
}

export function check2TimeRange(validationSource: string | null): IRange<Date> {
  const range = checkRange(validationSource);
  const minDate = moment(range.min, TIME_TEMPLATE);
  const maxDate = moment(range.max, TIME_TEMPLATE);
  return {
    minValue: minDate.isValid() ? minDate.date(1).month(1).year(2000).toDate() : undefined,
    maxValue: maxDate.isValid() ? maxDate.date(1).month(1).year(2000).toDate() : undefined
  };
}

export function check2DateRange(validationSource: string | null): IRange<Date> {
  const range = checkRange(validationSource);
  const minDate = moment(range.min, DATE_TEMPLATE);
  const maxDate = moment(range.max, DATE_TEMPLATE);
  return {
    minValue: minDate.isValid() ? minDate.toDate() : undefined,
    maxValue: maxDate.isValid() ? maxDate.toDate() : undefined
  };
}

export function checkRange(validationSource: string | null): { min: string | undefined, max: string | undefined } {
  if (validationSource) {
    // for gedemin's decimal and numeric
    switch (validationSource) {
      case "CHECK(VALUE >= 0)":
      case "CHECK(((VALUE IS NULL) OR (VALUE >= 0)))":
      case "CHECK((VALUE IS NULL) OR (VALUE >= 0))":
        return {min: "0", max: undefined};
      case "CHECK ((VALUE IS NULL) OR ((VALUE >= 0) AND (VALUE <=1)))":
        return {min: "0", max: "1"};
      default:
        const fullRangeTemplate = /^CHECK ?\((VALUE ?>= ?(.+) AND VALUE ?<= ?(.+))\)$/i;
        const minTemplate = /^CHECK ?\((VALUE ?>= ?(.+))\)$/i;
        const maxTemplate = /^CHECK ?\((VALUE ?<= ?(.+))\)$/i;
        if (fullRangeTemplate.test(validationSource)) {
          return {
            min: validationSource.replace(fullRangeTemplate, "$2"),
            max: validationSource.replace(fullRangeTemplate, "$3")
          };
        }
        if (minTemplate.test(validationSource)) {
          return {
            min: validationSource.replace(minTemplate, "$2"),
            max: undefined
          };
        }
        if (maxTemplate.test(validationSource)) {
          return {
            min: undefined,
            max: validationSource.replace(maxTemplate, "$2")
          };
        }
        console.warn(`Not processed: ${validationSource}`);
        break;
    }
  }
  return {min: undefined, max: undefined};
}

export function cropDefault(defaultSource: string | null): string | null {
  if (defaultSource) {
    return defaultSource
      .replace(/DEFAULT /i, "")
      .replace(/^'(.+(?='$))'$/, "$1");
  }
  return defaultSource;
}

export function default2Boolean(defaultSource: string | null): boolean {
  defaultSource = cropDefault(defaultSource);
  return Boolean(defaultSource);
}

export function default2Int(defaultSource: string | null): number | undefined {
  defaultSource = cropDefault(defaultSource);
  const num = Number(defaultSource);
  return (num || num === 0) && Number.isInteger(num) ? num : undefined;
}

export function default2Number(defaultSource: string | null): number | undefined {
  defaultSource = cropDefault(defaultSource);
  const num = Number(defaultSource);
  return (num || num === 0) ? num : undefined;
}

export function default2String(defaultSource: string | null): string | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource) {
    return defaultSource;
  }
}

export function default2Time(defaultSource: string | null): Date | ContextVariables | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource === "CURRENT_TIME") {
    return "CURRENT_TIME";
  }
  const mDate = moment(defaultSource!, TIME_TEMPLATE);
  if (mDate.isValid()) {
    return mDate.date(1).month(1).year(2000).toDate();
  }
}

export function default2Timestamp(defaultSource: string | null): Date | ContextVariables | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource === "CURRENT_TIMESTAMP(0)") {
    return "CURRENT_TIMESTAMP(0)";
  }
  const mDate = moment(defaultSource!, TIMESTAMP_TEMPLATE);
  if (mDate.isValid()) {
    return mDate.toDate();
  }
}

export function default2Date(defaultSource: string | null): Date | ContextVariables | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource === "CURRENT_DATE") {
    return "CURRENT_DATE";
  }
  const mDate = moment(defaultSource!, DATE_TEMPLATE);
  if (mDate.isValid()) {
    return mDate.toDate();
  }
}

export function date2Str(date: Date | ContextVariables): string {
  return `'${moment(date).format(DATE_TEMPLATE)}'`;
}

export function dateTime2Str(date: Date | ContextVariables): string {
  return `'${moment(date).format(TIMESTAMP_TEMPLATE)}'`;
}

export function time2Str(date: Date | ContextVariables): string {
  return `'${moment(date).format(TIME_TEMPLATE)}'`;
}
