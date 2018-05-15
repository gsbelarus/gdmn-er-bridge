"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default2Int(defaultValue) {
    var num = Number(defaultValue);
    return (num || num === 0) && Number.isInteger(num) ? num : undefined;
}
exports.default2Int = default2Int;
function default2Number(defaultValue) {
    var num = Number(defaultValue);
    return (num || num === 0) ? num : undefined;
}
exports.default2Number = default2Number;
function default2Date(defaultValue) {
    switch (defaultValue) {
        case 'CURRENT_TIMESTAMP(0)': return 'CURRENT_TIMESTAMP(0)';
        case 'CURRENT_TIMESTAMP': return 'CURRENT_TIMESTAMP';
        case 'CURRENT_TIME': return 'CURRENT_TIME';
        case 'CURRENT_DATE': return 'CURRENT_DATE';
        default:
            if (defaultValue && Date.parse(defaultValue))
                return new Date(defaultValue);
            return undefined;
    }
}
exports.default2Date = default2Date;
//# sourceMappingURL=util.js.map