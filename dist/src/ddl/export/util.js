"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const Constants_1 = require("../Constants");
function isCheckForBoolean(validationSource) {
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
exports.isCheckForBoolean = isCheckForBoolean;
function check2Enum(validationSource) {
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
exports.check2Enum = check2Enum;
function check2StrMin(validationSource) {
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
exports.check2StrMin = check2StrMin;
function check2IntRange(validationSource, rangeLimit) {
    switch (validationSource) {
        case "CHECK (VALUE > 0)":
            return { minValue: 1, maxValue: rangeLimit && rangeLimit.max !== undefined ? rangeLimit.max : undefined };
        default:
            return check2NumberRange(validationSource, rangeLimit);
    }
}
exports.check2IntRange = check2IntRange;
function check2NumberRange(validationSource, rangeLimit) {
    const { min, max } = rangeLimit || { min: undefined, max: undefined };
    const range = checkRange(validationSource);
    let minValue = range.min !== undefined ? Number.parseFloat(range.min) : min;
    let maxValue = range.max !== undefined ? Number.parseFloat(range.max) : max;
    if (minValue !== undefined && min !== undefined && minValue < min) {
        minValue = min;
    }
    if (maxValue !== undefined && max !== undefined && maxValue > max) {
        maxValue = max;
    }
    return { minValue, maxValue };
}
exports.check2NumberRange = check2NumberRange;
function check2TimestampRange(validationSource) {
    const range = checkRange(validationSource);
    let minDate = moment_1.default.utc(range.min, Constants_1.Constants.TIMESTAMP_TEMPLATE);
    let maxDate = moment_1.default.utc(range.max, Constants_1.Constants.TIMESTAMP_TEMPLATE);
    if (minDate.isValid() && minDate.isBefore(Constants_1.Constants.MIN_TIMESTAMP)) {
        minDate = moment_1.default.utc(Constants_1.Constants.MIN_TIMESTAMP, Constants_1.Constants.TIMESTAMP_TEMPLATE);
    }
    if (maxDate.isValid() && maxDate.isAfter(Constants_1.Constants.MAX_TIMESTAMP)) {
        maxDate = moment_1.default.utc(Constants_1.Constants.MAX_TIMESTAMP, Constants_1.Constants.TIMESTAMP_TEMPLATE);
    }
    return {
        minValue: minDate.isValid() ? minDate.local().toDate() : Constants_1.Constants.MIN_TIMESTAMP,
        maxValue: maxDate.isValid() ? maxDate.local().toDate() : Constants_1.Constants.MAX_TIMESTAMP
    };
}
exports.check2TimestampRange = check2TimestampRange;
function check2TimeRange(validationSource) {
    const range = checkRange(validationSource);
    const minDate = moment_1.default.utc(range.min, Constants_1.Constants.TIME_TEMPLATE);
    const maxDate = moment_1.default.utc(range.max, Constants_1.Constants.TIME_TEMPLATE);
    if (minDate.isValid()) {
        minDate.year(Constants_1.Constants.MIN_TIMESTAMP.getUTCFullYear())
            .month(Constants_1.Constants.MIN_TIMESTAMP.getUTCMonth())
            .date(Constants_1.Constants.MIN_TIMESTAMP.getUTCDate());
    }
    if (maxDate.isValid()) {
        maxDate.year(Constants_1.Constants.MIN_TIMESTAMP.getUTCFullYear())
            .month(Constants_1.Constants.MIN_TIMESTAMP.getUTCMonth())
            .date(Constants_1.Constants.MIN_TIMESTAMP.getUTCDate());
    }
    return {
        minValue: minDate.isValid() ? minDate.local().toDate() : undefined,
        maxValue: maxDate.isValid() ? maxDate.local().toDate() : undefined
    };
}
exports.check2TimeRange = check2TimeRange;
function check2DateRange(validationSource) {
    const range = checkRange(validationSource);
    let minDate = moment_1.default.utc(range.min, Constants_1.Constants.DATE_TEMPLATE);
    let maxDate = moment_1.default.utc(range.max, Constants_1.Constants.DATE_TEMPLATE);
    if (minDate.isValid() && minDate.isBefore(Constants_1.Constants.MIN_TIMESTAMP)) {
        minDate = moment_1.default.utc(Constants_1.Constants.MIN_TIMESTAMP, Constants_1.Constants.DATE_TEMPLATE);
    }
    if (maxDate.isValid() && maxDate.isAfter(Constants_1.Constants.MAX_TIMESTAMP)) {
        maxDate = moment_1.default.utc(Constants_1.Constants.MAX_TIMESTAMP, Constants_1.Constants.DATE_TEMPLATE);
    }
    return {
        minValue: minDate.isValid() ? minDate.local().toDate() : Constants_1.Constants.MIN_TIMESTAMP,
        maxValue: maxDate.isValid() ? maxDate.local().toDate() : Constants_1.Constants.MAX_TIMESTAMP
    };
}
exports.check2DateRange = check2DateRange;
function checkRange(validationSource) {
    if (validationSource) {
        switch (validationSource) {
            // custom formats
            case "CHECK(((VALUE IS NULL) OR (VALUE >= 0)))": // двойные общие скобки
                return { min: "0", max: undefined };
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
    return { min: undefined, max: undefined };
}
exports.checkRange = checkRange;
function cropDefault(defaultSource) {
    if (defaultSource) {
        return defaultSource
            .replace(/DEFAULT /i, "")
            .replace(/^'(.+(?='$))'$/i, "$1");
    }
    return defaultSource;
}
exports.cropDefault = cropDefault;
function default2Boolean(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    return !!defaultSource && Boolean(Number.parseInt(defaultSource));
}
exports.default2Boolean = default2Boolean;
function default2Int(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    if (defaultSource) {
        return Number.parseInt(defaultSource);
    }
}
exports.default2Int = default2Int;
function default2Float(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    if (defaultSource) {
        return Number.parseFloat(defaultSource);
    }
}
exports.default2Float = default2Float;
function default2String(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    if (defaultSource) {
        return defaultSource;
    }
}
exports.default2String = default2String;
function default2Time(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    if (defaultSource === "CURRENT_TIME") {
        return defaultSource;
    }
    const mDate = moment_1.default.utc(defaultSource, Constants_1.Constants.TIME_TEMPLATE);
    if (mDate.isValid()) {
        return mDate
            .year(Constants_1.Constants.MIN_TIMESTAMP.getUTCFullYear())
            .month(Constants_1.Constants.MIN_TIMESTAMP.getUTCMonth())
            .date(Constants_1.Constants.MIN_TIMESTAMP.getUTCDate())
            .local().toDate();
    }
}
exports.default2Time = default2Time;
function default2Timestamp(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    if (defaultSource === "CURRENT_TIMESTAMP") {
        return defaultSource;
    }
    if (defaultSource === "CURRENT_TIMESTAMP(0)") {
        return defaultSource;
    }
    const mDate = moment_1.default.utc(defaultSource, Constants_1.Constants.TIMESTAMP_TEMPLATE);
    if (mDate.isValid()) {
        return mDate.local().toDate();
    }
}
exports.default2Timestamp = default2Timestamp;
function default2Date(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    if (defaultSource === "CURRENT_DATE") {
        return defaultSource;
    }
    const mDate = moment_1.default.utc(defaultSource, Constants_1.Constants.DATE_TEMPLATE);
    if (mDate.isValid()) {
        return mDate.local().toDate();
    }
}
exports.default2Date = default2Date;
//# sourceMappingURL=util.js.map