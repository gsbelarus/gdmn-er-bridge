"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var moment_1 = __importDefault(require("moment"));
exports.MIN_TIMESTAMP = new Date(1900, 0, 1, 0, 0, 0, 0);
exports.MAX_TIMESTAMP = new Date(9999, 11, 31, 23, 59, 99, 999);
var TIME_TEMPLATE = "HH:mm:ss.SSS";
var DATE_TEMPLATE = "DD.MM.YYYY";
var TIMESTAMP_TEMPLATE = "DD.MM.YYYY HH:mm:ss.SSS";
function isCheckForBoolean(validationSource) {
    if (validationSource) {
        switch (validationSource) {
            // custom formats
            default:
                var template = /^CHECK\s*\((\(?VALUE \s*IS \s*NULL\)?\s*OR\s*)?\(?VALUE \s*IN\s*\(0,\s*1\)\)?\)$/i;
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
    var enumValues = [];
    if (validationSource) {
        var valuesTemplate = /CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?(\(?VALUE\s+IN\s*\(\s*){1}((?:\'[A-Z0-9]\'(?:\,\s*)?)+)\)?\)\)/i;
        var match = void 0;
        if (match = valuesTemplate.exec(validationSource)) {
            var valueTemplate = /\'([A-Z0-9]{1})\'/g;
            var enumValue = void 0;
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
                var template = /^CHECK\s*\((\(?VALUE \s*IS \s*NULL\)?\s*OR\s*)?\(?CHAR_LENGTH\s*\(VALUE\)\s*>=\s*(.+?)\)?\)$/i;
                if (template.test(validationSource)) {
                    return Number(validationSource.replace(template, "$2"));
                }
                console.warn("Not processed: " + validationSource);
                break;
        }
    }
}
exports.check2StrMin = check2StrMin;
function check2NumberRange(validationSource, rangeLimit) {
    var _a = rangeLimit || { min: undefined, max: undefined }, min = _a.min, max = _a.max;
    var range = checkRange(validationSource);
    var minValue = range.min !== undefined ? Number.parseFloat(range.min) : min;
    var maxValue = range.max !== undefined ? Number.parseFloat(range.max) : max;
    if (minValue !== undefined && min !== undefined && minValue < min) {
        minValue = min;
    }
    if (maxValue !== undefined && max !== undefined && maxValue > max) {
        maxValue = max;
    }
    return { minValue: minValue, maxValue: maxValue };
}
exports.check2NumberRange = check2NumberRange;
function check2TimestampRange(validationSource) {
    var range = checkRange(validationSource);
    var minDate = moment_1.default(range.min, TIMESTAMP_TEMPLATE);
    var maxDate = moment_1.default(range.max, TIMESTAMP_TEMPLATE);
    if (minDate.isValid() && minDate.isBefore(exports.MIN_TIMESTAMP)) {
        minDate = moment_1.default(exports.MIN_TIMESTAMP);
    }
    if (maxDate.isValid() && maxDate.isAfter(exports.MAX_TIMESTAMP)) {
        maxDate = moment_1.default(exports.MAX_TIMESTAMP);
    }
    return {
        minValue: minDate.isValid() ? minDate.toDate() : exports.MIN_TIMESTAMP,
        maxValue: maxDate.isValid() ? maxDate.toDate() : exports.MAX_TIMESTAMP
    };
}
exports.check2TimestampRange = check2TimestampRange;
function check2TimeRange(validationSource) {
    var range = checkRange(validationSource);
    var minDate = moment_1.default(range.min, TIME_TEMPLATE);
    var maxDate = moment_1.default(range.max, TIME_TEMPLATE);
    return {
        minValue: minDate.isValid() ? minDate.date(1).month(1).year(2000).toDate() : undefined,
        maxValue: maxDate.isValid() ? maxDate.date(1).month(1).year(2000).toDate() : undefined
    };
}
exports.check2TimeRange = check2TimeRange;
function check2DateRange(validationSource) {
    var range = checkRange(validationSource);
    var minDate = moment_1.default(range.min, DATE_TEMPLATE);
    var maxDate = moment_1.default(range.max, DATE_TEMPLATE);
    if (minDate.isValid() && minDate.isBefore(exports.MIN_TIMESTAMP)) {
        minDate = moment_1.default(exports.MIN_TIMESTAMP);
    }
    if (maxDate.isValid() && maxDate.isAfter(exports.MAX_TIMESTAMP)) {
        maxDate = moment_1.default(exports.MAX_TIMESTAMP);
    }
    return {
        minValue: minDate.isValid() ? minDate.toDate() : exports.MIN_TIMESTAMP,
        maxValue: maxDate.isValid() ? maxDate.toDate() : exports.MAX_TIMESTAMP
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
                var template = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?VALUE\s+BETWEEN\s+(.+?)\s+AND\s+(.+?)\)?\)$/i;
                if (template.test(validationSource)) {
                    return {
                        min: validationSource.replace(template, "$2"),
                        max: validationSource.replace(template, "$3")
                    };
                }
                var template2 = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?\(?VALUE\s*>=\s*(.+?)\)?\s*AND\s*\(?VALUE\s*<=\s*(.+?)\)?\)?\)$/i;
                if (template2.test(validationSource)) {
                    return {
                        min: validationSource.replace(template2, "$2"),
                        max: validationSource.replace(template2, "$3")
                    };
                }
                var minTemplate = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?VALUE\s*>=\s*(.+?)\)?\)$/i;
                if (minTemplate.test(validationSource)) {
                    return {
                        min: validationSource.replace(minTemplate, "$2"),
                        max: undefined
                    };
                }
                var maxTemplate = /^CHECK\s*\((\(?VALUE\s+IS\s+NULL\)?\s*OR\s*)?\(?VALUE\s*<=\s*(.+?)\)?\)$/i;
                if (maxTemplate.test(validationSource)) {
                    return {
                        min: undefined,
                        max: validationSource.replace(maxTemplate, "$2")
                    };
                }
                console.warn("Not processed: " + validationSource);
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
    return Boolean(defaultSource);
}
exports.default2Boolean = default2Boolean;
function default2Int(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    var num = Number(defaultSource);
    return (num || num === 0) && Number.isInteger(num) ? num : undefined;
}
exports.default2Int = default2Int;
function default2Number(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    var num = Number(defaultSource);
    return (num || num === 0) ? num : undefined;
}
exports.default2Number = default2Number;
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
    var mDate = moment_1.default(defaultSource, TIME_TEMPLATE);
    if (mDate.isValid()) {
        return mDate.date(1).month(1).year(2000).toDate();
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
    var mDate = moment_1.default(defaultSource, TIMESTAMP_TEMPLATE);
    if (mDate.isValid()) {
        return mDate.toDate();
    }
}
exports.default2Timestamp = default2Timestamp;
function default2Date(defaultSource) {
    defaultSource = cropDefault(defaultSource);
    if (defaultSource === "CURRENT_DATE") {
        return defaultSource;
    }
    var mDate = moment_1.default(defaultSource, DATE_TEMPLATE);
    if (mDate.isValid()) {
        return mDate.toDate();
    }
}
exports.default2Date = default2Date;
function date2Str(date) {
    return "'" + moment_1.default(date).format(DATE_TEMPLATE) + "'";
}
exports.date2Str = date2Str;
function dateTime2Str(date) {
    return "'" + moment_1.default(date).format(TIMESTAMP_TEMPLATE) + "'";
}
exports.dateTime2Str = dateTime2Str;
function time2Str(date) {
    return "'" + moment_1.default(date).format(TIME_TEMPLATE) + "'";
}
exports.time2Str = time2Str;
//# sourceMappingURL=util.js.map