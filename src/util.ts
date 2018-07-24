import {ContextVariables} from "gdmn-orm";
import moment from "moment";

export const MIN_TIMESTAMP = new Date(1900, 0, 1, 0, 0, 0, 0);
export const MAX_TIMESTAMP = new Date(9999, 11, 31, 23, 59, 99, 999);

const TIME_TEMPLATE = "HH:mm:ss.SSS";
const DATE_TEMPLATE = "DD.MM.YYYY";
const TIMESTAMP_TEMPLATE = "DD.MM.YYYY HH:mm:ss.SSS";

export interface IRange<T> {
  minValue: T | undefined;
  maxValue: T | undefined;
}

export function isCheckForBoolean(validationSource: string | null): boolean {
  if (validationSource) {
    switch (validationSource) {
      // custom formats
      default:
        const template = /^CHECK\s*\((\(?VALUE \s*IS \s*NULL\)?\s*OR\s*)?\(?VALUE \s*IN\s*\(0,\s*1\)\)?\)$/i;
        if (template.test(validationSource)) {
          return true;
        }
        break;
    }
  }
  return false;
}

export function check2Enum(validationSource: string | null): string [] {
  // TODO CHECK((VALUE IS NULL) OR (VALUE = 'M') OR (VALUE = 'F') OR ...)
  const enumValues = [];
  if (validationSource) {
    const valuesTemplate = /CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?(\(?VALUE\s+IN\s*\(\s*){1}((?:\'[A-Z0-9]\'(?:\,\s*)?)+)\)?\)\)/i;
    let match;
    if (match = valuesTemplate.exec(validationSource)) {
      const valueTemplate = /\'([A-Z0-9]{1})\'/g;
      let enumValue;
      while (enumValue = valueTemplate.exec(match[3])) {
        enumValues.push(enumValue[1]);
      }
    }
  }
  return enumValues;
}

export function check2StrMin(validationSource: string | null): number | undefined {
  if (validationSource) {
    switch (validationSource) {
      // custom formats
      case "CHECK (VALUE > '')":
      case "CHECK ((VALUE IS NULL) OR (VALUE > ''))":
        return 1;
      default:
        const template = /^CHECK\s*\((\(?VALUE \s*IS \s*NULL\)?\s*OR\s*)?\(?CHAR_LENGTH\s*\(VALUE\)\s*>=\s*(.+?)\)?\)$/i;
        if (template.test(validationSource)) {
          return Number(validationSource.replace(template, "$2"));
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
  let minDate = moment(range.min, TIMESTAMP_TEMPLATE);
  let maxDate = moment(range.max, TIMESTAMP_TEMPLATE);
  if (minDate.isValid() && minDate.isBefore(MIN_TIMESTAMP)) {
    minDate = moment(MIN_TIMESTAMP);
  }
  if (maxDate.isValid() && maxDate.isAfter(MAX_TIMESTAMP)) {
    maxDate = moment(MAX_TIMESTAMP);
  }
  return {
    minValue: minDate.isValid() ? minDate.toDate() : MIN_TIMESTAMP,
    maxValue: maxDate.isValid() ? maxDate.toDate() : MAX_TIMESTAMP
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
  let minDate = moment(range.min, DATE_TEMPLATE);
  let maxDate = moment(range.max, DATE_TEMPLATE);
  if (minDate.isValid() && minDate.isBefore(MIN_TIMESTAMP)) {
    minDate = moment(MIN_TIMESTAMP);
  }
  if (maxDate.isValid() && maxDate.isAfter(MAX_TIMESTAMP)) {
    maxDate = moment(MAX_TIMESTAMP);
  }
  return {
    minValue: minDate.isValid() ? minDate.toDate() : MIN_TIMESTAMP,
    maxValue: maxDate.isValid() ? maxDate.toDate() : MAX_TIMESTAMP
  };
}

export function checkRange(validationSource: string | null): { min: string | undefined, max: string | undefined } {
  if (validationSource) {
    switch (validationSource) {
      // custom formats
      case "CHECK(((VALUE IS NULL) OR (VALUE >= 0)))":  // двойные общие скобки
        return {min: "0", max: undefined};
      default:
        const template = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?VALUE\s+BETWEEN\s+(.+?)\s+AND\s+(.+?)\)?\)$/i;
        if (template.test(validationSource)) {
          return {
            min: validationSource.replace(template, "$2"),
            max: validationSource.replace(template, "$3")
          };
        }
        const template2 = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?\(?VALUE\s*>=\s*(.+?)\)?\s*AND\s*\(?VALUE\s*<=\s*(.+?)\)?\)?\)$/i;
        if (template2.test(validationSource)) {
          return {
            min: validationSource.replace(template2, "$2"),
            max: validationSource.replace(template2, "$3")
          };
        }
        const minTemplate = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?VALUE\s*>=\s*(.+?)\)?\)$/i;
        if (minTemplate.test(validationSource)) {
          return {
            min: validationSource.replace(minTemplate, "$2"),
            max: undefined
          };
        }
        const maxTemplate = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?VALUE\s*<=\s*(.+?)\)?\)$/i;
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
      .replace(/^'(.+(?='$))'$/i, "$1");
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
    return defaultSource;
  }
  const mDate = moment(defaultSource!, TIME_TEMPLATE);
  if (mDate.isValid()) {
    return mDate.date(1).month(1).year(2000).toDate();
  }
}

export function default2Timestamp(defaultSource: string | null): Date | ContextVariables | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource === "CURRENT_TIMESTAMP") {
    return defaultSource;
  }
  if (defaultSource === "CURRENT_TIMESTAMP(0)") {
    return defaultSource;
  }
  const mDate = moment(defaultSource!, TIMESTAMP_TEMPLATE);
  if (mDate.isValid()) {
    return mDate.toDate();
  }
}

export function default2Date(defaultSource: string | null): Date | ContextVariables | undefined {
  defaultSource = cropDefault(defaultSource);
  if (defaultSource === "CURRENT_DATE") {
    return defaultSource;
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
