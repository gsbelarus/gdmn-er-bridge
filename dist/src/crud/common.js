"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const Constants_1 = require("../ddl/Constants");
function flatten(nestedList) {
    const flatList = nestedList.reduce((acc, curr) => {
        if (Array.isArray(curr)) {
            return [...acc, ...curr];
        }
        return [...acc, curr];
    }, []);
    return flatList;
}
exports.flatten = flatten;
function zip3(xs, ys, zs) {
    const zipped = xs.map((x, index) => {
        return [x, ys[index], zs[index]];
    });
    return zipped;
}
exports.zip3 = zip3;
function groupAttrsValuesByType(attrsValues) {
    const byType = {
        scalarAttrsValues: [],
        entityAttrsValues: [],
        detailAttrsValues: [],
        setAttrsValues: []
    };
    return attrsValues.reduce((acc, curr) => {
        if (gdmn_orm_1.ScalarAttribute.isType(curr.attribute)) {
            const scalarAttrsValues = [...acc.scalarAttrsValues, curr];
            return Object.assign({}, acc, { scalarAttrsValues });
        }
        if (gdmn_orm_1.SetAttribute.isType(curr.attribute)) {
            const setAttrsValues = [...acc.setAttrsValues, curr];
            return Object.assign({}, acc, { setAttrsValues });
        }
        if (gdmn_orm_1.DetailAttribute.isType(curr.attribute)) {
            const detailAttrsValues = [...acc.detailAttrsValues, curr];
            return Object.assign({}, acc, { detailAttrsValues });
        }
        if (gdmn_orm_1.EntityAttribute.isType(curr.attribute)) {
            const entityAttrsValues = [...acc.entityAttrsValues, curr];
            return Object.assign({}, acc, { entityAttrsValues });
        }
        throw new Error("Unknow attribute type");
    }, byType);
}
exports.groupAttrsValuesByType = groupAttrsValuesByType;
;
function makeDetailAttrsSteps(masterKeyValue, detailAttrsValues) {
    const steps = detailAttrsValues.map(currDetailAttrValues => {
        const currDetailAttr = currDetailAttrValues.attribute;
        const [detailEntity] = currDetailAttr.entities;
        const detailRelation = currDetailAttr.adapter ?
            currDetailAttr.adapter.masterLinks[0].detailRelation :
            detailEntity.attribute.name;
        const link2masterField = currDetailAttr.adapter ?
            currDetailAttr.adapter.masterLinks[0].link2masterField :
            Constants_1.Constants.DEFAULT_MASTER_KEY_NAME;
        const parts = currDetailAttrValues.pks.map((pk, pkIndex) => {
            const pKeyNames = detailEntity.pk.map(k => k.name);
            const sqlPart = pKeyNames
                .map(name => `${name} = :${name}${pkIndex}`)
                .join(" AND ");
            const params = pKeyNames.reduce((acc, currName, currIndex) => {
                return Object.assign({}, acc, { [`${currName}${pkIndex}`]: pk[currIndex] });
            }, {});
            return { sqlPart, params };
        });
        const whereParams = parts.reduce((acc, part) => {
            return Object.assign({}, acc, part.params);
        }, {});
        const whereSQL = parts.map(part => part.sqlPart).join(" OR ");
        const sql = `UPDATE ${detailRelation} SET ${link2masterField} = (${masterKeyValue}) WHERE ${whereSQL}`;
        const step = { sql, params: whereParams };
        return step;
    });
    return steps;
}
exports.makeDetailAttrsSteps = makeDetailAttrsSteps;
function makeSetAttrsSteps(makeSQL, crossPKOwn, setAttrsValues) {
    const steps = setAttrsValues.map(currSetAttrValue => {
        const { crossValues, refIDs } = currSetAttrValue;
        const innerSteps = refIDs.map((currRefID, index) => {
            const currValues = crossValues[index] || [];
            const restCrossAttrsParams = currValues.reduce((acc, curr) => {
                return Object.assign({}, acc, { [curr.attribute.name]: curr.value });
            }, {});
            const params = Object.assign({ [Constants_1.Constants.DEFAULT_CROSS_PK_OWN_NAME]: crossPKOwn, [Constants_1.Constants.DEFAULT_CROSS_PK_REF_NAME]: currRefID }, restCrossAttrsParams);
            const attrsNames = Object.keys(params);
            const placeholders = attrsNames.map(name => `:${name}`);
            let crossTableName;
            if (currSetAttrValue.attribute.adapter) {
                crossTableName = currSetAttrValue.attribute.adapter.crossRelation;
            }
            else {
                crossTableName = currSetAttrValue.attribute.name;
            }
            const sql = makeSQL(crossTableName, attrsNames, placeholders);
            const step = { sql, params };
            return step;
        });
        return innerSteps;
    });
    const flat = flatten(steps);
    return flat;
}
exports.makeSetAttrsSteps = makeSetAttrsSteps;
//# sourceMappingURL=common.js.map