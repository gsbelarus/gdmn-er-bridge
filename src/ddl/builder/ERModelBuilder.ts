import {AConnection, ATransaction} from "gdmn-db";
import {
  DetailAttribute,
  Entity,
  EntityAttribute,
  ERModel,
  ParentAttribute,
  Sequence,
  SequenceAttribute,
  SetAttribute
} from "gdmn-orm";
import {Constants} from "../Constants";
import {DDLHelper, IFieldProps} from "../DDLHelper";
import {Builder} from "./Builder";
import {DomainResolver} from "./DomainResolver";
import {EntityBuilder} from "./EntityBuilder";

export class ERModelBuilder extends Builder {

  private _entityBuilder: EntityBuilder | undefined;

  get entityBuilder(): EntityBuilder {
    if (!this._entityBuilder || !this._entityBuilder.prepared) {
      throw new Error("Need call prepare");
    }
    return this._entityBuilder;
  }

  public async prepare(connection: AConnection, transaction: ATransaction): Promise<void> {
    await super.prepare(connection, transaction);

    this._entityBuilder = new EntityBuilder(this._getDDLHelper(), this._getATHelper());
  }

  public async initERModel(erModel: ERModel = new ERModel()): Promise<ERModel> {
    if (!Object.values(erModel.sequencies).some((seq) => seq.name == Constants.GLOBAL_GENERATOR)) {
      erModel.addSequence(new Sequence({name: Constants.GLOBAL_GENERATOR}));
    }
    return erModel;
  }

  public async addSequence(erModel: ERModel, sequence: Sequence): Promise<Sequence> {
    return erModel.addSequence(sequence);
  }

  public async addEntity(erModel: ERModel, entity: Entity): Promise<Entity> {
    // TODO pk only EntityAttribute and ScalarAttribute
    if (entity.parent) {
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
          relation: Builder._getOwnRelationName(entity),
          field: Constants.DEFAULT_ID_NAME
        }
      }));
    }
    erModel.add(entity);

    const tableName = Builder._getOwnRelationName(entity);
    const fields: IFieldProps[] = [];
    for (const pkAttr of entity.pk) {
      const fieldName = Builder._getFieldName(pkAttr);
      const domainName = await this._getDDLHelper().addDomain(DomainResolver.resolve(pkAttr));
      await this._insertATAttr(pkAttr, {relationName: tableName, fieldName, domainName});
      fields.push({
        name: fieldName,
        domain: domainName
      });
    }

    await this._getDDLHelper().addTable(tableName, fields);
    await this._getDDLHelper().addPrimaryKey(tableName, fields.map((i) => i.name));
    await this._insertATEntity(entity, {relationName: tableName});

    for (const pkAttr of entity.pk) {
      if (SequenceAttribute.isType(pkAttr)) {
        const fieldName = Builder._getFieldName(pkAttr);
        const seqAdapter = pkAttr.sequence.adapter;
        await this._getDDLHelper().addAutoIncrementTrigger(tableName, fieldName,
          seqAdapter ? seqAdapter.sequence : pkAttr.sequence.name);
      } else if (DetailAttribute.isType(pkAttr)) {
        // ignore
      } else if (ParentAttribute.isType(pkAttr)) {
        // ignore
      } else if (SetAttribute.isType(pkAttr)) {
        // ignore
      } else if (EntityAttribute.isType(pkAttr)) { // for inheritance
        const fieldName = Builder._getFieldName(pkAttr);
        await this._getDDLHelper().addForeignKey(DDLHelper.DEFAULT_FK_OPTIONS, {
          tableName,
          fieldName
        }, {
          tableName: Builder._getOwnRelationName(pkAttr.entities[0]),
          fieldName: Builder._getFieldName(pkAttr.entities[0].pk[0])
        });
      }
    }

    for (const attr of Object.values(entity.ownAttributes)) {
      if (!entity.pk.includes(attr)) {
        await this.entityBuilder.addAttribute(entity, attr);
      }
    }

    for (const unique of entity.unique) {
      await this.entityBuilder.addUnique(entity, unique);
    }

    return entity;
  }

  // public removeEntity(erModel: ERModel, entity: Entity): Promise<void> {
  //   // TODO
  // }
}
