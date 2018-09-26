"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Query_1 = require("./crud/query/Query");
const Constants_1 = require("./ddl/Constants");
const ERExport2_1 = require("./ddl/export/ERExport2");
const ERImport_1 = require("./ddl/import/ERImport");
const UpdateManager_1 = require("./ddl/updates/UpdateManager");
class ERBridge {
    constructor(connection) {
        this._connection = connection;
    }
    static completeERModel(erModel) {
        if (!Object.values(erModel.sequencies).some((seq) => seq.name == Constants_1.Constants.GLOBAL_GENERATOR)) {
            erModel.addSequence(new gdmn_orm_1.Sequence({ name: Constants_1.Constants.GLOBAL_GENERATOR }));
        }
        return erModel;
    }
    static addEntityToERModel(erModel, entity) {
        const idAttr = Object.values(entity.ownAttributes).find((attr) => attr.name === Constants_1.Constants.DEFAULT_ID_NAME);
        if (idAttr) {
            if (!gdmn_orm_1.SequenceAttribute.isType(idAttr)) {
                throw new Error("Attribute named 'ID' must be SequenceAttribute");
            }
        }
        else if (entity.parent) {
            const entityAttr = entity.add(new gdmn_orm_1.EntityAttribute({
                name: Constants_1.Constants.DEFAULT_INHERITED_KEY_NAME,
                required: true,
                lName: { ru: { name: "Родитель" } },
                entities: [entity.parent]
            }));
            entity.pk.push(entityAttr);
        }
        else {
            entity.add(new gdmn_orm_1.SequenceAttribute({
                name: Constants_1.Constants.DEFAULT_ID_NAME,
                lName: { ru: { name: "Идентификатор" } },
                sequence: erModel.sequencies[Constants_1.Constants.GLOBAL_GENERATOR],
                adapter: {
                    relation: entity.adapter ? entity.adapter.relation[entity.adapter.relation.length - 1].relationName : entity.name,
                    field: Constants_1.Constants.DEFAULT_ID_NAME
                }
            }));
        }
        erModel.add(entity);
        return entity;
    }
    async exportFromDatabase(dbStructure, transaction, erModel = new gdmn_orm_1.ERModel()) {
        return await new ERExport2_1.ERExport2(this._connection, transaction, dbStructure, erModel).execute();
        // return await erExport(dbStructure, this._connection, transaction, erModel);
    }
    async importToDatabase(erModel) {
        return await new ERImport_1.ERImport(this._connection, erModel).execute();
    }
    async initDatabase() {
        await new UpdateManager_1.UpdateManager().updateDatabase(this._connection);
    }
    async query(erModel, dbStructure, query) {
        return await Query_1.Query.execute(this._connection, erModel, dbStructure, query);
    }
}
exports.ERBridge = ERBridge;
//# sourceMappingURL=ERBridge.js.map