import {existsSync, unlinkSync} from "fs";
import {AConnection} from "gdmn-db";
import {
  BlobAttribute,
  BooleanAttribute,
  DateAttribute,
  DetailAttribute,
  Entity,
  EntityAttribute,
  EnumAttribute,
  ERModel,
  FloatAttribute,
  IntegerAttribute,
  MAX_16BIT_INT,
  MAX_32BIT_INT,
  MIN_16BIT_INT,
  MIN_32BIT_INT,
  NumericAttribute,
  ParentAttribute,
  SetAttribute,
  StringAttribute,
  TimeAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import moment from "moment";
import {Constants} from "../Constants";
import {ERBridge} from "../ERBridge";
import {importTestDBDetail} from "./testDB";

describe("ERBridge", () => {
  const {driver, options} = importTestDBDetail;
  const connection = driver.newConnection();
  const erBridge = new ERBridge(connection);

  const loadERModel = () => AConnection.executeTransaction({
    connection,
    callback: async (transaction) => {
      const dbStructure = await driver.readDBStructure(connection, transaction);
      return await erBridge.exportFromDatabase(dbStructure, transaction, new ERModel());
    }
  });

  beforeEach(async () => {
    if (existsSync(options.path)) {
      unlinkSync(options.path);
    }
    await connection.createDatabase(options);
    await erBridge.initDatabase();
  });

  afterEach(async () => {
    await connection.dropDatabase();
  });

  it("empty entity", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));


    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("integer", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

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
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("numeric", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

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
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("blob", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

    entity.add(new BlobAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new BlobAttribute("FIELD2", {ru: {name: "Поле 2"}}, false));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("boolean", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

    entity.add(new BooleanAttribute("FIELD1", {ru: {name: "Поле 1"}}, true, true,
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new BooleanAttribute("FIELD2", {ru: {name: "Поле 2"}}, false, false));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("string", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

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
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("date", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

    entity.add(new DateAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      moment.utc().year(1999).month(10).date(3).startOf("date").local().toDate(),
      moment.utc().year(2099).startOf("year").local().toDate(),
      moment.utc().startOf("date").local().toDate(),
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new DateAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
      moment.utc(Constants.MIN_TIMESTAMP).startOf("date").local().toDate(),
      moment.utc(Constants.MAX_TIMESTAMP).startOf("date").local().toDate(),
      "CURRENT_DATE"));
    entity.add(new DateAttribute("FIELD3", {ru: {name: "Поле 3"}}, false,
      moment.utc(Constants.MIN_TIMESTAMP).startOf("date").local().toDate(),
      moment.utc(Constants.MAX_TIMESTAMP).startOf("date").local().toDate(),
      undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("time", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

    entity.add(new TimeAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      moment.utc().year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).startOf("date").local().toDate(),
      moment.utc().year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).endOf("date").local().toDate(),
      moment.utc().year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).local().toDate(),
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new TimeAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
      moment.utc(Constants.MIN_TIMESTAMP, Constants.TIME_TEMPLATE).local().toDate(),
      moment.utc(Constants.MAX_TIMESTAMP, Constants.TIME_TEMPLATE)
        .year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).local().toDate(),
      "CURRENT_TIME"));
    entity.add(new TimeAttribute("FIELD3", {ru: {name: "Поле 3"}}, false,
      moment.utc(Constants.MIN_TIMESTAMP, Constants.TIME_TEMPLATE).local().toDate(),
      moment.utc(Constants.MAX_TIMESTAMP, Constants.TIME_TEMPLATE)
        .year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).local().toDate(),
      undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("timestamp", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

    entity.add(new TimeStampAttribute("FIELD1", {ru: {name: "Поле 1"}}, true,
      moment.utc().year(1999).month(10).startOf("month").local().toDate(),
      moment.utc().year(2099).month(1).date(1).endOf("date").local().toDate(),
      moment.utc().local().toDate(),
      [], {relation: "TEST", field: "FIELD_ADAPTER"}));
    entity.add(new TimeStampAttribute("FIELD2", {ru: {name: "Поле 2"}}, false,
      moment.utc(Constants.MIN_TIMESTAMP).local().toDate(),
      moment.utc(Constants.MAX_TIMESTAMP).local().toDate(),
      "CURRENT_TIMESTAMP"));
    entity.add(new TimeStampAttribute("FIELD3", {ru: {name: "Поле 3"}}, false,
      moment.utc(Constants.MIN_TIMESTAMP).local().toDate(),
      moment.utc(Constants.MAX_TIMESTAMP).local().toDate(),
      undefined));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("float", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

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
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("enum", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

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
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("link to entity", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity1 = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST1",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));
    const entity2 = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST2",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

    entity1.add(new EntityAttribute("LINK", {ru: {name: "Ссылка"}}, true, [entity2]));
    entity2.add(new EntityAttribute("LINK", {ru: {name: "Ссылка"}}, false, [entity1]));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
  });

  it("parent link to entity", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity1 = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST1",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));
    const entity2 = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST2",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

    entity1.add(new ParentAttribute("PARENT", {ru: {name: "Ссылка"}}, [entity2]));
    entity1.add(new ParentAttribute("LINK", {ru: {name: "Ссылка"}}, [entity2]));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
  });

  it("detail entity", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity2 = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST2",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));
    const entity1 = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST1",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));
    const entity3 = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST3",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

    entity1.add(new DetailAttribute("DETAILLINK", {ru: {name: "Позиции 1"}}, true, [entity2], [], {
      masterLinks: [{
        detailRelation: "TEST2",
        link2masterField: "MASTER_KEY"
      }]
    }));
    entity1.add(new DetailAttribute("TEST3", {ru: {name: "Позиции 2"}}, true, [entity3]));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    const loadEntity3 = loadedERModel.entity("TEST3");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity3).toEqual(entity3);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
    expect(loadEntity3.serialize()).toEqual(entity3.serialize());
  });

  it("set link to entity", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity1 = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST1",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));
    const entity2 = ERBridge.addEntityToERModel(erModel, new Entity(undefined,
      "TEST2",
      {ru: {name: "entity name", fullName: "full entity name"}},
      false));

    const crossRelation = "CROSS_5"; // generated value
    const setAttr = new SetAttribute("SET1", {ru: {name: "Ссылка"}}, true, [entity2], 0, [], {crossRelation});

    setAttr.add(new IntegerAttribute("FIELD1", {ru: {name: "Поле 1", fullName: "FULLNAME"}}, true,
      MIN_16BIT_INT, MAX_16BIT_INT, -100, [], {relation: crossRelation, field: "FIELD_ADAPTER1"}));
    setAttr.add(new IntegerAttribute("FIELD2", {ru: {name: "Поле 2", fullName: "FULLNAME"}}, true,
      MIN_32BIT_INT, MAX_32BIT_INT, -10000, []));
    // setAttr.add(new IntegerAttribute("FIELD3", {ru: {name: "Поле 3", fullName: "FULLNAME"}}, true,
    //   MIN_64BIT_INT, MAX_64BIT_INT, -100000000000000, []));
    setAttr.add(new IntegerAttribute("FIELD4", {ru: {name: "Поле 4", fullName: "FULLNAME"}}, false,
      MIN_16BIT_INT, MAX_16BIT_INT + 1, 0, []));
    setAttr.add(new IntegerAttribute("FIELD5", {ru: {name: "Поле 5", fullName: "FULLNAME"}}, false,
      MIN_16BIT_INT, MAX_16BIT_INT + 1, undefined));

    setAttr.add(new NumericAttribute("FIELD6", {ru: {name: "Поле 6"}}, true,
      4, 2, 40, 1000, 40.36, [], {relation: crossRelation, field: "FIELD_ADAPTER2"}));
    setAttr.add(new NumericAttribute("FIELD7", {ru: {name: "Поле 7"}}, false,
      4, 2, 40, 1000, 40.36));
    setAttr.add(new NumericAttribute("FIELD8", {ru: {name: "Поле 8"}}, false,
      4, 2, 40, 1000, undefined));

    setAttr.add(new BooleanAttribute("FIELD9", {ru: {name: "Поле 9"}}, true, true,
      [], {relation: crossRelation, field: "FIELD_ADAPTER3"}));
    setAttr.add(new BooleanAttribute("FIELD10", {ru: {name: "Поле 10"}}, false, false));

    setAttr.add(new StringAttribute("FIELD11", {ru: {name: "Поле 11"}}, true,
      5, 30, "test default", true, undefined,
      [], {relation: crossRelation, field: "FIELD_ADAPTER4"}));
    setAttr.add(new StringAttribute("FIELD12", {ru: {name: "Поле 12"}}, false,
      1, 160, "test default", true, undefined));
    setAttr.add(new StringAttribute("FIELD13", {ru: {name: "Поле 13"}}, false,
      1, 160, undefined, true, undefined));

    setAttr.add(new FloatAttribute("FIELD14", {ru: {name: "Поле 14"}}, true,
      -123, 123123123123123123123123, 40,
      [], {relation: crossRelation, field: "FIELD_ADAPTER5"}));
    // entity.add(new FloatAttribute("FIELD15", {ru: {name: "Поле 15"}}, false,
    //   Number.MIN_VALUE, Number.MAX_VALUE, 40));
    setAttr.add(new FloatAttribute("FIELD16", {ru: {name: "Поле 16"}}, true,
      -123, 123123123123123123123123, undefined));

    setAttr.add(new EnumAttribute("FIELD17", {ru: {name: "Поле 17"}}, true, [
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
    ], "Z", [], {relation: crossRelation, field: "FIELD_ADAPTER6"}));
    setAttr.add(new EnumAttribute("FIELD18", {ru: {name: "Поле 18"}}, false,
      [{value: "Z"}, {value: "X"}, {value: "Y"}], "Z"));
    setAttr.add(new EnumAttribute("FIELD19", {ru: {name: "Поле 19"}}, false,
      [{value: "Z"}, {value: "X"}, {value: "Y"}], undefined));

    entity1.add(setAttr);

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
  });
});
