"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
exports.gdDomains = {
    "DGENDER": (name, lName, adapter) => new gdmn_orm_1.EnumAttribute({ name, lName, values: [{ value: "M" }, { value: "F" }, { value: "N" }], adapter }),
    // следующие домены надо проверить, возможно уже нигде и не используются
    "DTYPETRANSPORT": (name, lName, adapter) => new gdmn_orm_1.EnumAttribute({
        name, lName, adapter,
        values: [{ value: "C" }, { value: "S" }, { value: "R" }, { value: "O" }, { value: "W" }]
    }),
    "GD_DIPADDRESS": (name, lName, adapter) => new gdmn_orm_1.StringAttribute({
        name, lName, equired: true, autoTrim: true, maxLength: 15, adapter,
        mask: /([1-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])(\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])){3}\/\d+/
    }),
    "DSTORAGE_DATA_TYPE": (name, lName, adapter) => new gdmn_orm_1.EnumAttribute({
        name, lName, required: true, adapter,
        values: [
            { value: "G" }, { value: "U" }, { value: "O" }, { value: "T" }, { value: "F" },
            { value: "S" }, { value: "I" }, { value: "C" }, { value: "L" }, { value: "D" },
            { value: "B" }
        ]
    })
};
//# sourceMappingURL=gddomains.js.map