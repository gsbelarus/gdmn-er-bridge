"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Constants_1 = require("./Constants");
const erexport_1 = require("./export/erexport");
const ERImport_1 = require("./import/ERImport");
const Query_1 = require("./query/Query");
const Update1_1 = require("./updates/Update1");
const UpdateManager_1 = require("./updates/UpdateManager");
class ERBridge {
    constructor(connection) {
        this._connection = connection;
    }
    static completeERModel(erModel) {
        if (!Object.values(erModel.sequencies).some((seq) => seq.name == Update1_1.GLOBAL_GENERATOR)) {
            erModel.addSequence(new gdmn_orm_1.Sequence({ name: Update1_1.GLOBAL_GENERATOR }));
        }
        return erModel;
    }
    static addEntityToERModel(erModel, entity) {
        const idAttr = Object.values(entity.attributes).find((attr) => attr.name === Constants_1.Constants.DEFAULT_ID_NAME);
        if (idAttr) {
            if (!gdmn_orm_1.SequenceAttribute.isType(idAttr)) {
                throw new Error("Attribute named 'ID' must be SequenceAttribute");
            }
        }
        else if (!entity.parent) {
            entity.add(new gdmn_orm_1.SequenceAttribute({
                name: Constants_1.Constants.DEFAULT_ID_NAME,
                lName: { ru: { name: "Идентификатор" } },
                sequence: erModel.sequencies[Update1_1.GLOBAL_GENERATOR]
            }));
        }
        erModel.add(entity);
        return entity;
    }
    async exportFromDatabase(dbStructure, transaction, erModel = new gdmn_orm_1.ERModel()) {
        return await erexport_1.erExport(dbStructure, this._connection, transaction, erModel);
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