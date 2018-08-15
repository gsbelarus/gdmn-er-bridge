import {AConnection, ATransaction, DBStructure} from "gdmn-db";
import {Entity, EntityAttribute, ERModel, IEntityQueryInspector, Sequence, SequenceAttribute} from "gdmn-orm";
import {Query} from "./crud/query/Query";
import {Constants} from "./ddl/Constants";
import {ERExport2} from "./ddl/export/ERExport2";
import {ERImport} from "./ddl/import/ERImport";
import {UpdateManager} from "./ddl/updates/UpdateManager";

export interface IQueryResponse {
  data: any[];
  aliases: Array<{ alias: string, attribute: string, values: any }>;
  sql: {
    query: string;
    params: { [field: string]: any };
  };
}

export class ERBridge {

  private readonly _connection: AConnection;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  public static completeERModel(erModel: ERModel): ERModel {
    if (!Object.values(erModel.sequencies).some((seq) => seq.name == Constants.GLOBAL_GENERATOR)) {
      erModel.addSequence(new Sequence({name: Constants.GLOBAL_GENERATOR}));
    }

    return erModel;
  }

  public static addEntityToERModel(erModel: ERModel, entity: Entity): Entity {
    const idAttr = Object.values(entity.ownAttributes).find((attr) => attr.name === Constants.DEFAULT_ID_NAME);
    if (idAttr) {
      if (!SequenceAttribute.isType(idAttr)) {
        throw new Error("Attribute named 'ID' must be SequenceAttribute");
      }
    } else if (entity.parent) {
      const entityAttr = entity.add(new EntityAttribute({
        name: Constants.DEFAULT_INHERITED_KEY_NAME,
        required: true,
        lName: {ru: {name: "Родитель"}},
        entities: [entity.parent]
      }));
      entity.pk.push(entityAttr);
    } else {
      entity.add(new SequenceAttribute({
        name: Constants.DEFAULT_ID_NAME,
        lName: {ru: {name: "Идентификатор"}},
        sequence: erModel.sequencies[Constants.GLOBAL_GENERATOR],
        adapter: {
          relation: entity.adapter ? entity.adapter.relation[entity.adapter.relation.length - 1].relationName : entity.name,
          field: Constants.DEFAULT_ID_NAME
        }
      }));
    }
    erModel.add(entity);

    return entity;
  }

  public async exportFromDatabase(dbStructure: DBStructure,
                                  transaction: ATransaction,
                                  erModel: ERModel = new ERModel()): Promise<ERModel> {
    return await new ERExport2(this._connection, transaction, dbStructure, erModel).execute();
    // return await erExport(dbStructure, this._connection, transaction, erModel);
  }

  public async importToDatabase(erModel: ERModel): Promise<void> {
    return await new ERImport(this._connection, erModel).execute();
  }

  public async initDatabase(): Promise<void> {
    await new UpdateManager().updateDatabase(this._connection);
  }

  public async query(erModel: ERModel, dbStructure: DBStructure, query: IEntityQueryInspector): Promise<IQueryResponse> {
    return await Query.execute(this._connection, erModel, dbStructure, query);
  }
}
