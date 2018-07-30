import {existsSync, unlinkSync} from "fs";
import {AConnection} from "gdmn-db";
import {SemCategory} from "gdmn-nlp";
import {
  BlobAttribute,
  BooleanAttribute,
  DateAttribute,
  Entity,
  EnumAttribute,
  ERModel,
  FloatAttribute,
  IntegerAttribute,
  MAX_16BIT_INT,
  MAX_32BIT_INT,
  MIN_16BIT_INT,
  MIN_32BIT_INT,
  NumericAttribute,
  Sequence,
  SequenceAttribute,
  StringAttribute,
  TimeAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import {Entity2RelationMap} from "gdmn-orm/src/rdbadapter";
import {LName} from "gdmn-orm/src/types";
import moment from "moment";
import {ERBridge} from "../ERBridge";
import {GLOBAL_GENERATOR} from "../updates/Update1";
import {MAX_TIMESTAMP, MIN_TIMESTAMP, TIME_TEMPLATE} from "../util";
import {importTestDBDetail} from "./testDB";

describe("ERBridge", () => {
  const {driver, options} = importTestDBDetail;
  const connection = driver.newConnection();
  const erBridge = new ERBridge(connection);

  const createERModel = () => {
    const erModel = new ERModel();
    erModel.addSequence(new Sequence(GLOBAL_GENERATOR));
    return erModel;
  };
  const createEntity = (erModel: ERModel,
                        parent: Entity | undefined,
                        name: string,
                        lName: LName,
                        isAbstract: boolean,
                        semCategories: SemCategory[] = [],
                        adapter?: Entity2RelationMap) => {
    const entity = new Entity(parent, name, lName, isAbstract, semCategories, adapter);
    // auto added field
    if (!parent) {
      entity.add(new SequenceAttribute("ID", {ru: {name: "Идентификатор"}}, erModel.sequencies[GLOBAL_GENERATOR]));
    }
    erModel.add(entity);
    return entity;
  };
  const loadERModel = () => AConnection.executeTransaction({
    connection,
    callback: async (transaction) => {
      const dbStructure = await driver.readDBStructure(connection, transaction);
      const erModel = await erBridge.exportFromDatabase(dbStructure, transaction, new ERModel());
      console.log(Object.keys(erModel.entities));
      return erModel;
    }
  });

  beforeEach(async () => {
    if (existsSync(options.path)) {
      unlinkSync(options.path);
    }
    await connection.createDatabase(options);
    await erBridge.init();
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  it("empty entity", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("integer", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new IntegerAttribute("FIELD1", {ru: {name: "Поле 1", fullName: "FULLNAME"}}, true,
      MIN_16BIT_INT, MAX_16BIT_INT, -100, [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new IntegerAttribute("FIELD2", {ru: {name: "Поле 2", fullName: "FULLNAME"}}, true,
      MIN_32BIT_INT, MAX_32BIT_INT, -10000, []));
    // entity.add(new IntegerAttribute("FIELD3", {ru: {name: "Поле 3", fullName: "FULLNAME"}}, true,
    //   MIN_64BIT_INT, MAX_64BIT_INT, -100000000000000, []));
    entity.add(new IntegerAttribute("FIELD4", {ru: {name: "Поле 4", fullName: "FULLNAME"}}, false,
      MIN_16BIT_INT, MAX_16BIT_INT + 1, 0, []));
    entity.add(new IntegerAttribute("FIELD5", {ru: {name: "Поле 5", fullName: "FULLNAME"}}, false,
      MIN_16BIT_INT, MAX_16BIT_INT + 1, undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("numeric", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new NumericAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      4, 2, 40, 1000, 40.36, [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new NumericAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
      4, 2, 40, 1000, 40.36));
    entity.add(new NumericAttribute("FIELD3", {ru: {name: "Поле 3"}}, false,
      4, 2, 40, 1000, undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("blob", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new BlobAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new BlobAttribute("FIELD2", {ru: {name: "Поле 2"}}, false));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("boolean", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new BooleanAttribute("FIELD1", {ru: {name: "Поле 1"}}, true, true,
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new BooleanAttribute("FIELD2", {ru: {name: "Поле 2"}}, false, false));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("string", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new StringAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      5, 30, "test default", true, undefined,
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new StringAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
      1, 160, "test default", true, undefined));
    entity.add(new StringAttribute("FIELD3", {ru: {name: "Поле 3"}}, false,
      1, 160, undefined, true, undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("date", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new DateAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      moment.utc().year(1999).month(10).date(3).startOf("date").local().toDate(),
      moment.utc().year(2099).startOf("year").local().toDate(),
      moment.utc().startOf("date").local().toDate(),
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new DateAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
      moment.utc(MIN_TIMESTAMP).startOf("date").local().toDate(),
      moment.utc(MAX_TIMESTAMP).startOf("date").local().toDate(),
      "CURRENT_DATE"));
    entity.add(new DateAttribute("FIELD3", {ru: {name: "Поле 3"}}, false,
      moment.utc(MIN_TIMESTAMP).startOf("date").local().toDate(),
      moment.utc(MAX_TIMESTAMP).startOf("date").local().toDate(),
      undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("time", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new TimeAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      moment.utc().year(MIN_TIMESTAMP.getUTCFullYear()).month(MIN_TIMESTAMP.getUTCMonth()).date(MIN_TIMESTAMP.getDate())
        .startOf("date").local().toDate(),
      moment.utc().year(MIN_TIMESTAMP.getUTCFullYear()).month(MIN_TIMESTAMP.getUTCMonth()).date(MIN_TIMESTAMP.getDate())
        .endOf("date").local().toDate(),
      moment.utc().year(MIN_TIMESTAMP.getUTCFullYear()).month(MIN_TIMESTAMP.getUTCMonth()).date(MIN_TIMESTAMP.getDate())
        .local().toDate(),
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new TimeAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
      moment.utc(MIN_TIMESTAMP, TIME_TEMPLATE).local().toDate(),
      moment.utc(MAX_TIMESTAMP, TIME_TEMPLATE)
        .year(MIN_TIMESTAMP.getUTCFullYear()).month(MIN_TIMESTAMP.getUTCMonth()).date(MIN_TIMESTAMP.getDate())
        .local().toDate(),
      "CURRENT_TIME"));
    entity.add(new TimeAttribute("FIELD3", {ru: {name: "Поле 3"}}, false,
      moment.utc(MIN_TIMESTAMP, TIME_TEMPLATE).local().toDate(),
      moment.utc(MAX_TIMESTAMP, TIME_TEMPLATE)
        .year(MIN_TIMESTAMP.getUTCFullYear()).month(MIN_TIMESTAMP.getUTCMonth()).date(MIN_TIMESTAMP.getDate())
        .local().toDate(),
      undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("timestamp", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new TimeStampAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      moment.utc().year(1999).month(10).startOf("month").local().toDate(),
      moment.utc().year(2099).month(1).date(1).endOf("date").local().toDate(),
      moment.utc().local().toDate(),
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new TimeStampAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
      moment.utc(MIN_TIMESTAMP).local().toDate(),
      moment.utc(MAX_TIMESTAMP).local().toDate(),
      "CURRENT_TIMESTAMP"));
    entity.add(new TimeStampAttribute("FIELD3", {ru: {name: "Поле 3"}}, false,
      moment.utc(MIN_TIMESTAMP).local().toDate(),
      moment.utc(MAX_TIMESTAMP).local().toDate(),
      undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("float", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new FloatAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      -123, 123123123123123123123123, 40,
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    // entity.add(new FloatAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
    //   Number.MIN_VALUE, Number.MAX_VALUE, 40));
    entity.add(new FloatAttribute("FIELD3", {ru: {name: "Поле 3"}}, true,
      -123, 123123123123123123123123, undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });

  it("enum", async () => {
    const erModel = createERModel();
    const entity = createEntity(erModel,
      undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false);
    entity.add(new EnumAttribute("FIELD1", {ru: {name: "Поле 1"}}, true, [
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
    ], "Z", [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new EnumAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
      [{value: "Z"}, {value: "X"}, {value: "Y"}], "Z"));
    entity.add(new EnumAttribute("FIELD3", {ru: {name: "Поле 3"}}, false,
      [{value: "Z"}, {value: "X"}, {value: "Y"}], undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
  });
});
