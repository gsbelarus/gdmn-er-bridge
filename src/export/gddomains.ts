import * as erm from "gdmn-orm";
import {Attribute2FieldMap, LName} from "gdmn-orm";

export type createDomainFunc =
  (attributeName: string, lName: LName, adapter?: Attribute2FieldMap) => erm.Attribute;
export const gdDomains: { [name: string]: createDomainFunc } = {
  "DGENDER": (attributeName: string, lName: LName, adapter?: Attribute2FieldMap) =>
    new erm.EnumAttribute(attributeName, lName, false, [{value: "M"}, {value: "F"}, {value: "N"}], undefined, [], adapter),
  // следующие домены надо проверить, возможно уже нигде и не используются
  "DTYPETRANSPORT": (attributeName: string, lName: LName, adapter?: Attribute2FieldMap) =>
    new erm.EnumAttribute(attributeName, lName, false, [{value: "C"}, {value: "S"}, {value: "R"}, {value: "O"}, {value: "W"}], undefined, [], adapter),
  "GD_DIPADDRESS": (attributeName: string, lName: LName, adapter?: Attribute2FieldMap) =>
    new erm.StringAttribute(attributeName, lName, true, undefined, 15, undefined, true, /([1-9]|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])(\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])){3}\/\d+/, [], adapter),
  "DSTORAGE_DATA_TYPE": (attributeName: string, lName: LName, adapter?: Attribute2FieldMap) =>
    new erm.EnumAttribute(attributeName, lName, true,
      [
        {value: "G"}, {value: "U"}, {value: "O"}, {value: "T"}, {value: "F"},
        {value: "S"}, {value: "I"}, {value: "C"}, {value: "L"}, {value: "D"},
        {value: "B"}
      ], undefined, [], adapter)
};
