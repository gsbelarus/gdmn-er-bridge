"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("./common");
function buildInsertSteps(input) {
    const { entity, attrsValues } = input;
    const { scalarAttrsValues, entityAttrsValues, setAttrsValues, detailAttrsValues } = common_1.groupAttrsValuesByType(attrsValues);
    if (scalarAttrsValues.length === 0 && entityAttrsValues.length === 0) {
        throw new Error("Must be at least one scalar or entity attribute for INSERT operation");
    }
    const returningStep = makeReturningIDsStep(entity, scalarAttrsValues, entityAttrsValues);
    const setAttrsValuesThunk = (crossPKOwn) => {
        return common_1.makeSetAttrsSteps(makeInsertSQL, crossPKOwn, setAttrsValues);
    };
    const detailAttrsValuesThunk = (masterKey) => {
        return common_1.makeDetailAttrsSteps(masterKey, detailAttrsValues);
    };
    return {
        returningStep,
        setAttrsValuesThunk,
        detailAttrsValuesThunk
    };
}
exports.buildInsertSteps = buildInsertSteps;
function makeInsertSQL(tableName, attrsNames, placeholders) {
    const attrsNamesString = attrsNames.join(", ");
    const placeholdersString = placeholders.join(", ");
    return `INSERT INTO ${tableName} (${attrsNamesString}) VALUES (${placeholdersString})`;
}
function makeReturningIDsStep(entity, scalarAttrsValues, entityAttrsValues) {
    const scalarAttrsValuesParams = scalarAttrsValues.reduce((acc, curr) => {
        return { ...acc, [curr.attribute.name]: curr.value };
    }, {});
    const entityAttrsValuesParams = entityAttrsValues.reduce((acc, curr) => {
        return { ...acc, [curr.attribute.name]: curr.values[0] };
    }, {});
    const params = { ...scalarAttrsValuesParams, ...entityAttrsValuesParams };
    const attrsNames = Object.keys(params);
    const placeholders = attrsNames.map(name => `:${name}`);
    const attrsNamesString = attrsNames.join(", ");
    const placeholdersString = placeholders.join(", ");
    const sql = `INSERT INTO ${entity.name} (${attrsNamesString}) VALUES (${placeholdersString}) RETURNING ID`;
    const step = { sql, params };
    return step;
}
//# sourceMappingURL=Insert.js.map