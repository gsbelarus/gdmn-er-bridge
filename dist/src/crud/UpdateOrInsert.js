"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
function buildUpdateOrInsertSteps(input) {
    const { entity, attrsValues } = input;
    const pk = input.pk;
    const { scalarAttrsValues, entityAttrsValues, setAttrsValues, detailAttrsValues } = common_1.groupAttrsValuesByType(attrsValues);
    const scalarsAndEntitiesSteps = makeScalarsAndEntitiesSteps(entity, pk, scalarAttrsValues, entityAttrsValues);
    const setsSteps = common_1.makeSetAttrsSteps(makeUpdateOrInsertSQL, pk[0], setAttrsValues);
    const detailsSteps = common_1.makeDetailAttrsSteps(pk[0], detailAttrsValues);
    const steps = [...scalarsAndEntitiesSteps, ...setsSteps, ...detailsSteps];
    return steps;
}
exports.buildUpdateOrInsertSteps = buildUpdateOrInsertSteps;
function makeUpdateOrInsertSQL(tableName, attrsNames, placeholders) {
    const attrsNamesString = attrsNames.join(", ");
    const placeholdersString = placeholders.join(", ");
    return `UPDATE OR INSERT INTO ${tableName} (${attrsNamesString}) VALUES (${placeholdersString})`;
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
    const names = [
        ...pkNames,
        ...scalarAttrsNames,
        ...entityAttrsNames
    ];
    const placeholders = names.map(name => `:${name}`);
    const sql = makeUpdateOrInsertSQL(entity.name, names, placeholders);
    // TODO: sql always the same, this is space for optimization.
    const steps = [{ sql, params }];
    return steps;
}
//# sourceMappingURL=UpdateOrInsert.js.map