"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("../ddl/Constants");
const common_1 = require("./common");
function buildUpdateSteps(input) {
    const { entity, attrsValues } = input;
    const pk = input.pk;
    const { scalarAttrsValues, entityAttrsValues, setAttrsValues, detailAttrsValues } = common_1.groupAttrsValuesByType(attrsValues);
    const scalarsAndEntitiesSteps = makeScalarsAndEntitiesSteps(entity, pk, scalarAttrsValues, entityAttrsValues);
    const setsSteps = makeSetAttrsSteps(pk[0], setAttrsValues);
    const detailsSteps = common_1.makeDetailAttrsSteps(pk[0], detailAttrsValues);
    const steps = [...scalarsAndEntitiesSteps, ...setsSteps, ...detailsSteps];
    return steps;
}
exports.buildUpdateSteps = buildUpdateSteps;
function makeUpdateSQL(tableName, attrsNamesSetPart, attrsNamesWherePart) {
    const setPart = attrsNamesSetPart.map(name => `${name} = :${name}`).join(", ");
    const wherePart = attrsNamesWherePart.map(name => `${name} = :${name}`).join(" AND ");
    const sql = `UPDATE ${tableName} SET ${setPart} WHERE ${wherePart}`;
    return sql;
}
function makeScalarsAndEntitiesSteps(entity, pk, scalarAttrsValues, entityAttrsValues) {
    if (scalarAttrsValues.length === 0 && entityAttrsValues.length === 0) {
        return [];
    }
    // TODO:
    // with complex primary keys?
    const pkNames = entity.pk.map(key => key.adapter.field);
    const pkParams = pkNames.reduce((acc, curr, currIndex) => {
        return Object.assign({}, acc, { [curr]: pk[currIndex] });
    }, {});
    const scalarAttrsValuesParams = scalarAttrsValues.reduce((acc, curr) => {
        return Object.assign({}, acc, { [curr.attribute.name]: curr.value });
    }, {});
    const entityAttrsValuesParams = entityAttrsValues.reduce((acc, curr) => {
        return Object.assign({}, acc, { [curr.attribute.name]: curr.values[0] });
    }, {});
    const params = Object.assign({}, pkParams, scalarAttrsValuesParams, entityAttrsValuesParams);
    const scalarAttrsNames = Object.keys(scalarAttrsValuesParams);
    const entityAttrsNames = Object.keys(entityAttrsValuesParams);
    const attrsNames = [
        ...scalarAttrsNames,
        ...entityAttrsNames
    ];
    const sql = makeUpdateSQL(entity.name, attrsNames, pkNames);
    // TODO: sql always the same, this is space for optimization.
    const steps = [{ sql, params }];
    return steps;
}
function makeSetAttrsSteps(crossPKOwn, setAttrsValues) {
    const flat = common_1.flatten(setAttrsValues.map(currSetAttrValue => {
        const { crossValues, refIDs } = currSetAttrValue;
        const currRefIDs = currSetAttrValue.currRefIDs;
        if (currRefIDs === undefined) {
            throw new Error("ISetAttrValue must provide currRefIDs for Update operation");
        }
        const innerSteps = common_1.zip3(refIDs, currRefIDs, crossValues).map(([refID, currRefID, currValues]) => {
            const currCrossValues = currValues || [];
            const restCrossAttrsParams = currCrossValues.reduce((acc, curr) => {
                return Object.assign({}, acc, { [curr.attribute.name]: curr.value });
            }, {});
            const setPartParams = Object.assign({ [Constants_1.Constants.DEFAULT_CROSS_PK_REF_NAME]: refID }, restCrossAttrsParams);
            const setPartNames = Object.keys(setPartParams);
            const setSQLPart = setPartNames.map(name => `${name} = :${name}`).join(", ");
            const wherePartParams = {
                [Constants_1.Constants.DEFAULT_CROSS_PK_OWN_NAME]: crossPKOwn,
                currRefID
            };
            const whereSQLPart = [`${Constants_1.Constants.DEFAULT_CROSS_PK_OWN_NAME} = :${Constants_1.Constants.DEFAULT_CROSS_PK_OWN_NAME}`, `${Constants_1.Constants.DEFAULT_CROSS_PK_REF_NAME} = :currRefID`].join(" AND ");
            let crossTableName;
            if (currSetAttrValue.attribute.adapter) {
                crossTableName = currSetAttrValue.attribute.adapter.crossRelation;
            }
            else {
                crossTableName = currSetAttrValue.attribute.name;
            }
            const sql = `UPDATE ${crossTableName} SET ${setSQLPart} WHERE ${whereSQLPart}`;
            const params = Object.assign({}, setPartParams, wherePartParams, restCrossAttrsParams);
            const step = { sql, params };
            return step;
        });
        return innerSteps;
    }));
    return flat;
}
//# sourceMappingURL=Update.js.map