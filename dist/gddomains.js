"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var erm = __importStar(require("gdmn-orm"));
exports.gdDomains = {
    'DEDITIONDATE': function (attributeName, lName, adapter) {
        return new erm.TimeStampAttribute(attributeName, { ru: { name: 'Изменено' } }, true, new Date('2000-01-01'), new Date('2100-12-31'), 'CURRENT_TIMESTAMP(0)', [], adapter);
    },
    'DCREATIONDATE': function (attributeName, lName, adapter) {
        return new erm.TimeStampAttribute(attributeName, { ru: { name: 'Создано' } }, true, new Date('2000-01-01'), new Date('2100-12-31'), 'CURRENT_TIMESTAMP(0)', [], adapter);
    },
    'DDOCUMENTDATE': function (attributeName, lName, adapter) {
        return new erm.TimeStampAttribute(attributeName, { ru: { name: 'Дата документа' } }, true, new Date('1900-01-01'), new Date('2100-12-31'), 'CURRENT_TIMESTAMP(0)', [], adapter);
    },
    'DQUANTITY': function (attributeName, lName, adapter) {
        return new erm.NumericAttribute(attributeName, lName, false, 15, 4, undefined, undefined, undefined, [], adapter);
    },
    'DLAT': function (attributeName, lName, adapter) {
        return new erm.NumericAttribute(attributeName, lName, false, 10, 8, -90, +90, undefined, [], adapter);
    },
    'DLON': function (attributeName, lName, adapter) {
        return new erm.NumericAttribute(attributeName, lName, false, 11, 8, -180, +180, undefined, [], adapter);
    },
    'DCURRENCY': function (attributeName, lName, adapter) {
        return new erm.NumericAttribute(attributeName, lName, false, 15, 4, undefined, undefined, undefined, [], adapter);
    },
    'DPOSITIVE': function (attributeName, lName, adapter) {
        return new erm.NumericAttribute(attributeName, lName, false, 15, 8, 0, undefined, undefined, [], adapter);
    },
    'DPERCENT': function (attributeName, lName, adapter) {
        return new erm.NumericAttribute(attributeName, lName, false, 7, 4, undefined, undefined, undefined, [], adapter);
    },
    'DTAX': function (attributeName, lName, adapter) {
        return new erm.NumericAttribute(attributeName, lName, false, 7, 4, 0, 99, undefined, [], adapter);
    },
    'DDECDIGITS': function (attributeName, lName, adapter) {
        return new erm.IntegerAttribute(attributeName, lName, false, 0, 16, undefined, [], adapter);
    },
    'DACCOUNTTYPE': function (attributeName, lName, adapter) {
        return new erm.EnumAttribute(attributeName, lName, false, [{ value: 'D' }, { value: 'K' }], undefined, [], adapter);
    },
    'DGENDER': function (attributeName, lName, adapter) {
        return new erm.EnumAttribute(attributeName, lName, false, [{ value: 'M' }, { value: 'F' }, { value: 'N' }], undefined, [], adapter);
    },
    'DTEXTALIGNMENT': function (attributeName, lName, adapter) {
        return new erm.EnumAttribute(attributeName, lName, false, [{ value: 'L' }, { value: 'R' }, { value: 'C' }, { value: 'J' }], 'L', [], adapter);
    },
    'DSECURITY': function (attributeName, lName, adapter) {
        return new erm.IntegerAttribute(attributeName, lName, true, undefined, undefined, -1, [], adapter);
    },
    'DDISABLED': function (attributeName, lName, adapter) {
        return new erm.BooleanAttribute(attributeName, lName, false, false, [], adapter);
    },
    'DBOOLEAN': function (attributeName, lName, adapter) {
        return new erm.BooleanAttribute(attributeName, lName, false, false, [], adapter);
    },
    'DBOOLEAN_NOTNULL': function (attributeName, lName, adapter) {
        return new erm.BooleanAttribute(attributeName, lName, true, false, [], adapter);
    },
    // следующие домены надо проверить, возможно уже нигде и не используются
    'DTYPETRANSPORT': function (attributeName, lName, adapter) {
        return new erm.EnumAttribute(attributeName, lName, false, [{ value: 'C' }, { value: 'S' }, { value: 'R' }, { value: 'O' }, { value: 'W' }], undefined, [], adapter);
    },
    'DGOLDQUANTITY': function (attributeName, lName, adapter) {
        return new erm.NumericAttribute(attributeName, lName, false, 15, 8, undefined, undefined, undefined, [], adapter);
    },
    'GD_DIPADDRESS': function (attributeName, lName, adapter) {
        return new erm.StringAttribute(attributeName, lName, true, undefined, 15, undefined, true, /([1-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])(\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])){3}\/\d+/, [], adapter);
    },
    'DSTORAGE_DATA_TYPE': function (attributeName, lName, adapter) {
        return new erm.EnumAttribute(attributeName, lName, true, [
            { value: 'G' }, { value: 'U' }, { value: 'O' }, { value: 'T' }, { value: 'F' },
            { value: 'S' }, { value: 'I' }, { value: 'C' }, { value: 'L' }, { value: 'D' },
            { value: 'B' }
        ], undefined, [], adapter);
    }
};
//# sourceMappingURL=gddomains.js.map