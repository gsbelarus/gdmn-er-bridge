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
import {Constants} from "../src/ddl/Constants";
import {ERBridge} from "../src/ERBridge";
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
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("integer", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new IntegerAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1", fullName: "FULLNAME"}}, required: true,
      minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT, defaultValue: -10000,
      adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    entity.add(new IntegerAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2", fullName: "FULLNAME"}}, required: true,
      minValue: MIN_32BIT_INT, maxValue: MAX_32BIT_INT, defaultValue: -10000
    }));
    // entity.add(new IntegerAttribute({
    //   name: "FIELD3", lName: {ru: {name: "Поле 3", fullName: "FULLNAME"}}, required: true,
    //   minValue: MIN_64BIT_INT, maxValue: MAX_64BIT_INT, defaultValue: -100000000000000
    // }));
    entity.add(new IntegerAttribute({
      name: "FIELD4", lName: {ru: {name: "Поле 4", fullName: "FULLNAME"}},
      minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT + 1, defaultValue: 0
    }));
    entity.add(new IntegerAttribute({
      name: "FIELD5", lName: {ru: {name: "Поле 5", fullName: "FULLNAME"}},
      minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT + 1
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("numeric", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new NumericAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      precision: 4, scale: 2, minValue: 40, maxValue: 1000, defaultValue: 40.36,
      adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    entity.add(new NumericAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2"}},
      precision: 4, scale: 2, minValue: 40, maxValue: 1000, defaultValue: 40.36
    }));
    entity.add(new NumericAttribute({
      name: "FIELD3", lName: {ru: {name: "Поле 3"}},
      precision: 4, scale: 2, minValue: 40, maxValue: 1000
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("blob", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new BlobAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    entity.add(new BlobAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2"}}
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("boolean", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new BooleanAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      defaultValue: true, adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    entity.add(new BooleanAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2"}}
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("string", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new StringAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      minLength: 5, maxLength: 30, defaultValue: "test default", autoTrim: true,
      adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    entity.add(new StringAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2"}},
      minLength: 1, maxLength: 160, defaultValue: "test default", autoTrim: true
    }));
    entity.add(new StringAttribute({
      name: "FIELD3", lName: {ru: {name: "Поле 3"}},
      minLength: 1, maxLength: 160, autoTrim: true
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("date", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new DateAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      minValue: moment.utc().year(1999).month(10).date(3).startOf("date").local().toDate(),
      maxValue: moment.utc().year(2099).startOf("year").local().toDate(),
      defaultValue: moment.utc().startOf("date").local().toDate(),
      adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    entity.add(new DateAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2"}},
      minValue: moment.utc(Constants.MIN_TIMESTAMP).startOf("date").local().toDate(),
      maxValue: moment.utc(Constants.MAX_TIMESTAMP).startOf("date").local().toDate(),
      defaultValue: "CURRENT_DATE"
    }));
    entity.add(new DateAttribute({
      name: "FIELD3", lName: {ru: {name: "Поле 3"}},
      minValue: moment.utc(Constants.MIN_TIMESTAMP).startOf("date").local().toDate(),
      maxValue: moment.utc(Constants.MAX_TIMESTAMP).startOf("date").local().toDate()
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("time", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new TimeAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      minValue: moment.utc().year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).startOf("date").local().toDate(),
      maxValue: moment.utc().year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).endOf("date").local().toDate(),
      defaultValue: moment.utc().year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).local().toDate(),
      adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    entity.add(new TimeAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2"}},
      minValue: moment.utc(Constants.MIN_TIMESTAMP, Constants.TIME_TEMPLATE).local().toDate(),
      maxValue: moment.utc(Constants.MAX_TIMESTAMP, Constants.TIME_TEMPLATE)
        .year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).local().toDate(),
      defaultValue: "CURRENT_TIME"
    }));
    entity.add(new TimeAttribute({
      name: "FIELD3", lName: {ru: {name: "Поле 3"}},
      minValue: moment.utc(Constants.MIN_TIMESTAMP, Constants.TIME_TEMPLATE).local().toDate(),
      maxValue: moment.utc(Constants.MAX_TIMESTAMP, Constants.TIME_TEMPLATE)
        .year(Constants.MIN_TIMESTAMP.getUTCFullYear()).month(Constants.MIN_TIMESTAMP.getUTCMonth())
        .date(Constants.MIN_TIMESTAMP.getDate()).local().toDate()
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("timestamp", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new TimeStampAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      minValue: moment.utc().year(1999).month(10).startOf("month").local().toDate(),
      maxValue: moment.utc().year(2099).month(1).date(1).endOf("date").local().toDate(),
      defaultValue: moment.utc().local().toDate(),
      adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    entity.add(new TimeStampAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2"}},
      minValue: moment.utc(Constants.MIN_TIMESTAMP).local().toDate(),
      maxValue: moment.utc(Constants.MAX_TIMESTAMP).local().toDate(),
      defaultValue: "CURRENT_TIMESTAMP"
    }));
    entity.add(new TimeStampAttribute({
      name: "FIELD3", lName: {ru: {name: "Поле 3"}},
      minValue: moment.utc(Constants.MIN_TIMESTAMP).local().toDate(),
      maxValue: moment.utc(Constants.MAX_TIMESTAMP).local().toDate()
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("float", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new FloatAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      minValue: -123, maxValue: 123123123123123123123123, defaultValue: 40,
      adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    // entity.add(new FloatAttribute({
    //   name: "FIELD2", lName: {ru: {name: "Поле 2"}},
    //   minValue: Number.MIN_VALUE, maxValue: Number.MAX_VALUE, defaultValue: 40
    // }));
    entity.add(new FloatAttribute({
      name: "FIELD3", lName: {ru: {name: "Поле 3"}}, required: true,
      minValue: -123, maxValue: 123123123123123123123123
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("enum", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new EnumAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      values: [
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
      ], defaultValue: "Z",
      adapter: {relation: "TEST", field: "FIELD_ADAPTER"}
    }));
    entity.add(new EnumAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2"}},
      values: [{value: "Z"}, {value: "X"}, {value: "Y"}], defaultValue: "Z"
    }));
    entity.add(new EnumAttribute({
      name: "FIELD3", lName: {ru: {name: "Поле 3"}},
      values: [{value: "Z"}, {value: "X"}, {value: "Y"}]
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("link to entity", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity1 = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST1",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));
    const entity2 = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST2",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity1.add(new EntityAttribute({
      name: "LINK", lName: {ru: {name: "Ссылка"}}, required: true, entities: [entity2]
    }));
    entity2.add(new EntityAttribute({
      name: "LINK", lName: {ru: {name: "Ссылка"}}, entities: [entity1]
    }));

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
    const entity1 = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST1",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));
    const entity2 = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST2",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity1.add(new ParentAttribute({name: "PARENT", lName: {ru: {name: "Ссылка"}}, entities: [entity2]}));
    entity1.add(new ParentAttribute({name: "LINK", lName: {ru: {name: "Ссылка"}}, entities: [entity2]}));

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
    const entity2 = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST2",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));
    const entity1 = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST1",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));
    const entity3 = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST3",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity1.add(new DetailAttribute({
      name: "DETAILLINK", lName: {ru: {name: "Позиции 1"}}, required: true, entities: [entity2],
      adapter: {
        masterLinks: [{
          detailRelation: "TEST2",
          link2masterField: "MASTER_KEY"
        }]
      }
    }));
    entity1.add(new DetailAttribute({
      name: "TEST3", lName: {ru: {name: "Позиции 2"}}, required: true, entities: [entity3]
    }));

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
    const entity1 = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST1",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));
    const entity2 = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST2",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    // TODO correct ordering
    const crossRelation = "CROSS_7"; // generated value
    const setAttr = entity1.add(new SetAttribute({
      name: "SET3", lName: {ru: {name: "Ссылка3"}}, required: true, entities: [entity2],
      adapter: {crossRelation}
    }));

    entity1.add(new SetAttribute({
      name: "SET1", lName: {ru: {name: "Ссылка1"}}, required: true, entities: [entity2], presLen: 120,
      adapter: {crossRelation: "CROSS_TABLE_ADAPTER1", presentationField: "SET_FIELD_ADAPTER"}
    }));

    entity1.add(new SetAttribute({
      name: "SET2", lName: {ru: {name: "Ссылка2"}}, required: true, entities: [entity2], presLen: 120,
      adapter: {crossRelation: "CROSS_TABLE_ADAPTER2"}
    }));

    setAttr.add(new IntegerAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1", fullName: "FULLNAME"}}, required: true,
      minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT, defaultValue: -100,
      adapter: {relation: crossRelation, field: "FIELD_ADAPTER1"}
    }));
    setAttr.add(new IntegerAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2", fullName: "FULLNAME"}}, required: true,
      minValue: MIN_32BIT_INT, maxValue: MAX_32BIT_INT, defaultValue: -1000
    }));
    // setAttr.add(new IntegerAttribute({
    //   name: "FIELD3", lName: {ru: {name: "Поле 3", fullName: "FULLNAME"}}, required: true,
    //   minValue: MIN_64BIT_INT, maxValue: MAX_64BIT_INT, defaultValue: -100000000000000
    // }));
    setAttr.add(new IntegerAttribute({
      name: "FIELD4", lName: {ru: {name: "Поле 4", fullName: "FULLNAME"}},
      minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT + 1, defaultValue: 0
    }));
    setAttr.add(new IntegerAttribute({
      name: "FIELD5", lName: {ru: {name: "Поле 5", fullName: "FULLNAME"}},
      minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT + 1
    }));

    setAttr.add(new NumericAttribute({
      name: "FIELD6", lName: {ru: {name: "Поле 6"}}, required: true,
      precision: 4, scale: 2, minValue: 40, maxValue: 1000, defaultValue: 40.36,
      adapter: {relation: crossRelation, field: "FIELD_ADAPTER2"}
    }));
    setAttr.add(new NumericAttribute({
      name: "FIELD7", lName: {ru: {name: "Поле 7"}},
      precision: 4, scale: 2, minValue: 40, maxValue: 1000, defaultValue: 40.36
    }));
    setAttr.add(new NumericAttribute({
      name: "FIELD8", lName: {ru: {name: "Поле 8"}},
      precision: 4, scale: 2, minValue: 40, maxValue: 1000
    }));

    setAttr.add(new BooleanAttribute({
      name: "FIELD9", lName: {ru: {name: "Поле 9"}}, required: true,
      defaultValue: true, adapter: {relation: crossRelation, field: "FIELD_ADAPTER3"}
    }));
    setAttr.add(new BooleanAttribute({
      name: "FIELD10", lName: {ru: {name: "Поле 10"}}
    }));

    setAttr.add(new StringAttribute({
      name: "FIELD11", lName: {ru: {name: "Поле 11"}}, required: true,
      minLength: 5, maxLength: 30, defaultValue: "test default", autoTrim: true,
      adapter: {relation: crossRelation, field: "FIELD_ADAPTER4"}
    }));
    setAttr.add(new StringAttribute({
      name: "FIELD12", lName: {ru: {name: "Поле 12"}},
      minLength: 1, maxLength: 160, defaultValue: "test default", autoTrim: true
    }));
    setAttr.add(new StringAttribute({
      name: "FIELD13", lName: {ru: {name: "Поле 13"}},
      minLength: 1, maxLength: 160, autoTrim: true
    }));

    setAttr.add(new FloatAttribute({
      name: "FIELD14", lName: {ru: {name: "Поле 14"}}, required: true,
      minValue: -123, maxValue: 123123123123123123123123, defaultValue: 40,
      adapter: {relation: crossRelation, field: "FIELD_ADAPTER5"}
    }));
    // setAttr.add(new FloatAttribute({
    //   name: "FIELD15", lName: {ru: {name: "Поле 15"}},
    //   minValue: Number.MIN_VALUE, maxValue: Number.MAX_VALUE, defaultValue: 40
    // }));
    setAttr.add(new FloatAttribute({
      name: "FIELD16", lName: {ru: {name: "Поле 16"}}, required: true,
      minValue: -123, maxValue: 123123123123123123123123
    }));

    setAttr.add(new EnumAttribute({
      name: "FIELD17", lName: {ru: {name: "Поле 17"}}, required: true,
      values: [
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
      ], defaultValue: "Z",
      adapter: {relation: crossRelation, field: "FIELD_ADAPTER6"}
    }));
    setAttr.add(new EnumAttribute({
      name: "FIELD18", lName: {ru: {name: "Поле 18"}},
      values: [{value: "Z"}, {value: "X"}, {value: "Y"}], defaultValue: "Z"
    }));
    setAttr.add(new EnumAttribute({
      name: "FIELD19", lName: {ru: {name: "Поле 19"}},
      values: [{value: "Z"}, {value: "X"}, {value: "Y"}]
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity1 = loadedERModel.entity("TEST1");
    const loadEntity2 = loadedERModel.entity("TEST2");
    expect(loadEntity1).toEqual(entity1);
    expect(loadEntity2).toEqual(entity2);
    expect(loadEntity1.serialize()).toEqual(entity1.serialize());
    expect(loadEntity2.serialize()).toEqual(entity2.serialize());
  });

  it("entity with unique fields", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());
    const entity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "TEST",
      lName: {ru: {name: "entity name", fullName: "full entity name"}}
    }));

    entity.add(new StringAttribute({
      name: "FIELD1", lName: {ru: {name: "Поле 1"}}, required: true,
      minLength: 5, maxLength: 30, defaultValue: "test default", autoTrim: true,
      adapter: {relation: "TEST", field: "FIELD_ADAPTER1"}
    }));
    entity.add(new IntegerAttribute({
      name: "FIELD2", lName: {ru: {name: "Поле 2", fullName: "FULLNAME"}}, required: true,
      minValue: MIN_16BIT_INT, maxValue: MAX_16BIT_INT, defaultValue: -100,
      adapter: {relation: "TEST", field: "FIELD_ADAPTER2"}
    }));
    entity.add(new FloatAttribute({
      name: "FIELD3", lName: {ru: {name: "Поле 3"}}, required: true,
      minValue: -123, maxValue: 123123123123123123123123, defaultValue: 40,
      adapter: {relation: "TEST", field: "FIELD_ADAPTER3"}
    }));

    entity.addUnique([entity.attribute("FIELD1"), entity.attribute("FIELD2")]);
    entity.addUnique([entity.attribute("FIELD2"), entity.attribute("FIELD3")]);

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadEntity = loadedERModel.entity("TEST");
    expect(loadEntity).toEqual(entity);
    expect(loadEntity.serialize()).toEqual(entity.serialize());
  });

  it("AUTH DATABASE", async () => {
    const erModel = ERBridge.completeERModel(new ERModel());

    // APP_USER
    const userEntity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "APP_USER", lName: {ru: {name: "Пользователь"}}
    }));
    userEntity.add(new StringAttribute({
      name: "LOGIN", lName: {ru: {name: "Логин"}}, required: true, minLength: 1, maxLength: 32
    }));
    userEntity.add(new BlobAttribute({
      name: "PASSWORD_HASH", lName: {ru: {name: "Хешированный пароль"}}, required: true
    }));
    userEntity.add(new BlobAttribute({name: "SALT", lName: {ru: {name: "Примесь"}}, required: true}));
    userEntity.add(new BooleanAttribute({
      name: "IS_ADMIN", lName: {ru: {name: "Флаг администратора"}}
    }));

    // APPLICATION
    const appEntity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "APPLICATION", lName: {ru: {name: "Приложение"}}
    }));
    const appUid = new StringAttribute({
      name: "UID", lName: {ru: {name: "Идентификатор приложения"}}, required: true, minLength: 1, maxLength: 36
    });
    appEntity.add(appUid);
    appEntity.addUnique([appUid]);
    appEntity.add(new TimeStampAttribute({
      name: "CREATIONDATE", lName: {ru: {name: "Дата создания"}}, required: true,
      minValue: Constants.MIN_TIMESTAMP, maxValue: Constants.MAX_TIMESTAMP, defaultValue: "CURRENT_TIMESTAMP"
    }));

    const appSet = new SetAttribute({
      name: "APPLICATIONS", lName: {ru: {name: "Приложения"}}, entities: [appEntity],
      adapter: {crossRelation: "APP_USER_APPLICATIONS"}
    });
    appSet.add(new StringAttribute({
      name: "ALIAS", lName: {ru: {name: "Название приложения"}}, required: true, minLength: 1, maxLength: 120
    }));
    userEntity.add(appSet);

    // APPLICATION_BACKUPS
    const backupEntity = ERBridge.addEntityToERModel(erModel, new Entity({
      name: "APPLICATION_BACKUPS", lName: {ru: {name: "Бэкап"}}
    }));
    const backupUid = new StringAttribute({
      name: "UID", lName: {ru: {name: "Идентификатор бэкапа"}}, required: true, minLength: 1, maxLength: 36
    });
    backupEntity.add(backupUid);
    backupEntity.addUnique([backupUid]);
    backupEntity.add(new EntityAttribute({
      name: "APP", lName: {ru: {name: "Приложение"}}, required: true, entities: [appEntity]
    }));
    backupEntity.add(new TimeStampAttribute({
      name: "CREATIONDATE", lName: {ru: {name: "Дата создания"}}, required: true,
      minValue: Constants.MIN_TIMESTAMP, maxValue: Constants.MAX_TIMESTAMP, defaultValue: "CURRENT_TIMESTAMP"
    }));
    backupEntity.add(new StringAttribute({
      name: "ALIAS", lName: {ru: {name: "Название бэкапа"}}, required: true, minLength: 1, maxLength: 120
    }));

    await erBridge.importToDatabase(erModel);

    const loadedERModel = await loadERModel();
    const loadUserEntity = loadedERModel.entity("APP_USER");
    const loadAppEntity = loadedERModel.entity("APPLICATION");
    expect(loadUserEntity).toEqual(userEntity);
    expect(loadUserEntity.serialize()).toEqual(userEntity.serialize());
    expect(loadAppEntity).toEqual(appEntity);
    expect(loadAppEntity.serialize()).toEqual(appEntity.serialize());
  });
});
