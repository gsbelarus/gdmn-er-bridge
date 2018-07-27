import * as fs from "fs";
import {AConnection} from "gdmn-db";
import {deserializeERModel, ERModel} from "gdmn-orm";
import {ERBridge} from "../ERBridge";
import {IDBDetail} from "../export/dbdetail";
import {exportTestDBDetail} from "./testDB";

// async function createDatabaseAndLoadERModel(dbDetail: IDBDetail) {
//   const {driver, options}: IDBDetail = dbDetail;
//
//   console.log(JSON.stringify(options, undefined, 2));
//   console.time("Total load time");
//   const connection = driver.newConnection();
//   await connection.createDatabase(options);
//   const erBridge = new ERBridge(connection);
//   await erBridge.init();
//   const result = await AConnection.executeTransaction({
//     connection,
//     callback: async (transaction) => {
//       console.time("DBStructure load time");
//       const dbStructure = await driver.readDBStructure(connection, transaction);
//       console.log(`DBStructure: ${Object.entries(dbStructure.relations).length} relations loaded...`);
//       console.timeEnd("DBStructure load time");
//       console.time("erModel load time");
//       const erModel = await erBridge.exportFromDatabase(dbStructure, transaction, new ERModel());
//       console.log(`erModel: loaded ${Object.entries(erModel.entities).length} entities`);
//       console.timeEnd("erModel load time");
//       return {
//         dbStructure,
//         erModel
//       };
//     }
//   });
//   await connection.disconnect();
//   return result;
// }

async function loadERModel(dbDetail: IDBDetail) {
  const {driver, options}: IDBDetail = dbDetail;

  console.log(JSON.stringify(options, undefined, 2));
  console.time("Total load time");
  return await AConnection.executeConnection({
    connection: driver.newConnection(),
    options,
    callback: async (connection) => {
      const erBridge = new ERBridge(connection);
      await erBridge.init();
      return await AConnection.executeTransaction({
        connection,
        callback: async (transaction) => {
          console.time("DBStructure load time");
          const dbStructure = await driver.readDBStructure(connection, transaction);
          console.log(`DBStructure: ${Object.entries(dbStructure.relations).length} relations loaded...`);
          console.timeEnd("DBStructure load time");
          console.time("erModel load time");
          const erModel = await erBridge.exportFromDatabase(dbStructure, transaction, new ERModel());
          console.log(`erModel: loaded ${Object.entries(erModel.entities).length} entities`);
          console.timeEnd("erModel load time");
          return {
            dbStructure,
            erModel
          };
        }
      });
    }
  });
}

describe("ERExport", () => {

  it("erExport", async () => {
    // const result = await loadERModel(importTestDBDetail);
    const result = await loadERModel(exportTestDBDetail);
    const serialized = result.erModel.serialize();
    const deserialized = deserializeERModel(serialized);

    if (fs.existsSync("c:/temp/test")) {
      fs.writeFileSync("c:/temp/test/ermodel.json",
        result.erModel.inspect().reduce((p, s) => `${p}${s}\n`, "")
      );
      console.log("ERModel has been written to c:/temp/test/ermodel.json");

      fs.writeFileSync("c:/temp/test/ermodel.serialized.json",
        JSON.stringify(serialized, undefined, 2)
      );
      console.log("Serialized ERModel has been written to c:/temp/test/ermodel.serialized.json");

      fs.writeFileSync("c:/temp/test/ermodel.test.json",
        JSON.stringify(deserialized.serialize(), undefined, 2)
      );
      console.log("Deserialized ERModel has been written to c:/temp/test/ermodel.test.json");
    }

    expect(serialized).toEqual(deserialized.serialize());
  }, 120000);
});
