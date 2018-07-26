import {Factory} from "gdmn-db";
import {resolve} from "path";
import {IDBDetail} from "../export/dbdetail";

export const exportTestDBDetail: IDBDetail = {
  alias: "exportTestDB",
  driver: Factory.FBDriver,
  options: {
    host: "192.168.0.34",
    port: 3053,
    username: "SYSDBA",
    password: "masterkey",
    path: "k:\\bases\\broiler\\GDBASE_2018_01_03.FDB"
  }
};

export const importTestDBDetail: IDBDetail = {
  alias: "importTestDB",
  driver: Factory.FBDriver,
  options: {
    host: "localhost",
    port: 3050,
    username: "SYSDBA",
    password: "masterkey",
    path: resolve("C:\\Users\\sywka\\Desktop\\gdmn", "TEST.FDB")
  }
};
