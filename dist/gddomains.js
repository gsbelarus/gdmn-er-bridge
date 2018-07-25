"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const erm = __importStar(require("gdmn-orm"));
exports.gdDomains = {
    "DGENDER": (attributeName, lName, adapter) => new erm.EnumAttribute(attributeName, lName, false, [{ value: "M" }, { value: "F" }, { value: "N" }], undefined, [], adapter),
    // следующие домены надо проверить, возможно уже нигде и не используются
    "DTYPETRANSPORT": (attributeName, lName, adapter) => new erm.EnumAttribute(attributeName, lName, false, [{ value: "C" }, { value: "S" }, { value: "R" }, { value: "O" }, { value: "W" }], undefined, [], adapter),
    "GD_DIPADDRESS": (attributeName, lName, adapter) => new erm.StringAttribute(attributeName, lName, true, undefined, 15, undefined, true, /([1-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])(\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])){3}\/\d+/, [], adapter),
    "DSTORAGE_DATA_TYPE": (attributeName, lName, adapter) => new erm.EnumAttribute(attributeName, lName, true, [
        { value: "G" }, { value: "U" }, { value: "O" }, { value: "T" }, { value: "F" },
        { value: "S" }, { value: "I" }, { value: "C" }, { value: "L" }, { value: "D" },
        { value: "B" }
    ], undefined, [], adapter)
};
//# sourceMappingURL=gddomains.js.map