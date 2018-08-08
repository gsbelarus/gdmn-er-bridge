import {AConnection, ATransaction, DBStructure} from "gdmn-db";
import {Entity, ERModel, isSequenceAttribute, Sequence, SequenceAttribute} from "gdmn-orm";
import {Constants} from "./Constants";
import {erExport} from "./export/erexport";
import {ERImport} from "./import/ERImport";
import {GLOBAL_GENERATOR} from "./updates/Update1";
import {UpdateManager} from "./updates/UpdateManager";

export class ERBridge {

  private readonly _connection: AConnection;

  constructor(connection: AConnection) {
    this._connection = connection;
  }

  public static completeERModel(erModel: ERModel): ERModel {
    if (!Object.values(erModel.sequencies).some((seq) => seq.name == GLOBAL_GENERATOR)) {
      erModel.addSequence(new Sequence(GLOBAL_GENERATOR));
    }

    return erModel;
  }

  public static addEntityToERModel(erModel: ERModel, entity: Entity): Entity {
    const idAttr = Object.values(entity.attributes).find((attr) => attr.name === Constants.DEFAULT_ID_NAME);
    if (idAttr) {
      if (!isSequenceAttribute(idAttr)) {
        throw new Error("Attribute named 'ID' must be SequenceAttribute");
      }
    } else if (!entity.parent) {
      entity.add(new SequenceAttribute(Constants.DEFAULT_ID_NAME, {ru: {name: "Идентификатор"}}, erModel.sequencies[GLOBAL_GENERATOR]));
    }
    erModel.add(entity);

    return entity;
  }

  public async exportFromDatabase(dbStructure: DBStructure,
                                  transaction: ATransaction,
                                  erModel: ERModel = new ERModel()): Promise<ERModel> {
    return await erExport(dbStructure, this._connection, transaction, erModel);
  }

  public async importToDatabase(erModel: ERModel): Promise<void> {
    return await new ERImport(this._connection, erModel).execute();
  }

  public async initDatabase(): Promise<void> {
    await new UpdateManager().updateDatabase(this._connection);
  }
}
