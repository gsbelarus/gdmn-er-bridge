import {existsSync, unlinkSync} from "fs";
import {AConnection} from "gdmn-db";
import {
  BlobAttribute,
  BooleanAttribute,
  DateAttribute,
  Entity,
  EnumAttribute,
  ERModel,
  FloatAttribute,
  IntegerAttribute,
  NumericAttribute,
  Sequence,
  SequenceAttribute,
  StringAttribute,
  TimeAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import moment from "moment";
import {ERBridge} from "../ERBridge";
import {importTestDBDetail} from "./testDB";

test("ERImport", async () => {
  const {driver, options} = importTestDBDetail;

  if (existsSync(options.path)) {
    unlinkSync(options.path);
  }

  const connection = driver.newConnection();
  await connection.createDatabase(options);
  const erBridge = new ERBridge(connection);

  const erModel = new ERModel();
  const gdcUnique = erModel.addSequence(new Sequence("GD_G_UNIQUE"));

  const relation = "TEST";
  const entity = new Entity(
    undefined,
    relation,
    {ru: {name: "тест", fullName: "FULLNAME"}},
    false);
  entity.add(new SequenceAttribute("ID", {ru: {name: "Идентификатор"}}, gdcUnique,
    {relation: relation, field: "ID"}));
  entity.add(new IntegerAttribute("FIELD2", {ru: {name: "Поле 2", fullName: "FULLNAME"}}, true,
    -150, 10, -100, [], {relation: relation, field: "FIELD_ADAPTER"}));
  entity.add(new IntegerAttribute("FIELD3", {ru: {name: "Поле 3", fullName: "FULLNAME"}}, true,
    -150, 1000000000000, -10000, []));
  entity.add(new NumericAttribute("FIELD4", {ru: {name: "Поле 4"}}, true,
    4, 2, 40, 1000, 40));
  entity.add(new BlobAttribute("FIELD5", {ru: {name: "Поле 5"}}, false));
  entity.add(new BooleanAttribute("FIELD6", {ru: {name: "Поле 6"}}, false, true));
  entity.add(new StringAttribute("FIELD7", {ru: {name: "Поле 7"}}, true,
    5, 30, "test", true, undefined));
  entity.add(new DateAttribute("FIELD8", {ru: {name: "Поле 8"}}, true,
    new Date(1999, 10, 10, 0, 0, 0, 0),
    new Date(2099, 1, 1, 0, 0, 0, 0),
    moment().hour(0).minute(0).second(0).millisecond(0).toDate()));
  entity.add(new TimeAttribute("FIELD9", {ru: {name: "Поле 9"}}, true,
    new Date(2000, 1, 1, 0, 0, 0, 0),
    new Date(2000, 1, 1, 23, 59, 59, 999),
    new Date(2000, 1, 1)));
  entity.add(new TimeStampAttribute("FIELD10", {ru: {name: "Поле 10"}}, true,
    new Date(1999, 10, 10, 0, 0, 0, 0),
    new Date(2099, 1, 1, 23, 59, 59, 999),
    new Date()));
  entity.add(new FloatAttribute("FIELD11", {ru: {name: "Поле 11"}}, true,
    -123, 123123123123123123123123, 40));
  entity.add(new EnumAttribute("FIELD12", {ru: {name: "Поле 12"}}, true, [
    {
      value: "Z",
      lName: {ru: {name: "Перечисление Z"}}
    },
    {
      value: "X",
      lName: {ru: {name: "Перечисление X"}}
    },
    {
      value: "Y",
      lName: {ru: {name: "Перечисление Y"}}
    }
  ], "Z"));
  erModel.add(entity);

  await erBridge.importToDatabase(erModel);

  const loadedERModel = await AConnection.executeTransaction({
    connection,
    callback: async (transaction) => {
      const dbStructure = await driver.readDBStructure(connection, transaction);
      return erBridge.exportFromDatabase(dbStructure, transaction, new ERModel());
    }
  });

  const loadEntity = loadedERModel.entity("TEST");
  expect(loadEntity).toEqual(entity);

  await connection.dropDatabase();

}, 120000);
