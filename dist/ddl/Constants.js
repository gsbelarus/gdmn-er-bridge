"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const Prefix_1 = require("./Prefix");
class Constants {
}
Constants.GLOBAL_GENERATOR = Prefix_1.Prefix.join("UNIQUE", Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR);
Constants.GLOBAL_DDL_GENERATOR = Prefix_1.Prefix.join("DDL", Prefix_1.Prefix.GDMN, Prefix_1.Prefix.GENERATOR);
Constants.DEFAULT_ID_NAME = "ID";
Constants.DEFAULT_INHERITED_KEY_NAME = "INHERITEDKEY";
Constants.DEFAULT_MASTER_KEY_NAME = "MASTERKEY";
Constants.DEFAULT_PARENT_KEY_NAME = "PARENT";
Constants.DEFAULT_CROSS_PK_OWN_NAME = "KEY1";
Constants.DEFAULT_CROSS_PK_REF_NAME = "KEY2";
Constants.TIME_TEMPLATE = "HH:mm:ss.SSS";
Constants.DATE_TEMPLATE = "DD.MM.YYYY";
Constants.TIMESTAMP_TEMPLATE = "DD.MM.YYYY HH:mm:ss.SSS";
Constants.MIN_TIMESTAMP = moment_1.default().utc().year(1900).startOf("year").toDate();
Constants.MAX_TIMESTAMP = moment_1.default().utc().year(9999).endOf("year").toDate();
exports.Constants = Constants;
//# sourceMappingURL=Constants.js.map