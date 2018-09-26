"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const gdmn_db_1 = require("gdmn-db");
const Constants_1 = require("../../ddl/Constants");
// Data for inserting application:
// 1. data for application
// 2. data for linked Entities (to update cross table):
//   a. primary keys with values
//   b. other attributes for cross table
// export interface IDatum {
//   attribute: Attribute;
//   value: any;
// }
class SQLInsertBuilder {
    constructor(insertData) {
        this._insertData = insertData;
    }
    build() {
        const { entity, attrsToValues, links } = this._insertData;
        const tableName = entity.name;
        const attributesNames = attrsToValues.map((attrToValue) => attrToValue.attribute.name);
        const valuesPlaceholders = attributesNames.map((attr) => `:${attr}`);
        const sql = `INSERT INTO ${tableName} (${attributesNames})
VALUES (${valuesPlaceholders})`;
        const params = attrsToValues.reduce((acc, curr) => {
            return { ...acc, [curr.attribute.name]: curr.value };
        }, {});
        const fstSteps = [{ sql, params }];
        if (links !== undefined) { // process Set, Detailed, Parent links
            const restSteps = links.reduce((acc, currLink) => {
                if (gdmn_orm_1.SetAttribute.isType(currLink.attribute)) {
                    // TODO:
                    // case of Set Link
                    //// check - SetAttribute exist
                    //// check - setAttr.entities has entity === mainEntity.name
                    //// check -  primaryAttributes.length === primaryAttributesValues
                    const { presentationField, crossRelation } = currLink.attribute.adapter;
                    console.log("Presentation field: ", presentationField);
                    const setAttributes = currLink.attribute.attributes;
                    console.log("attributes of SetAttributes: ", setAttributes);
                    const crossRelationAttrsNames = [
                        Constants_1.Constants.DEFAULT_CROSS_PK_OWN_NAME,
                        Constants_1.Constants.DEFAULT_CROSS_PK_REF_NAME, ...Object.keys(setAttributes)
                    ];
                    const [key1, , ...restAttrs] = crossRelationAttrsNames.map((name) => `:${name}`);
                    const justInsertedId = `(SELECT FIRST 1 ID FROM ${entity.name} ORDER BY ID DESC)`;
                    const valuesPlaceholders = [key1, justInsertedId, ...restAttrs];
                    const [ownKeyValue, refKeyValue] = currLink.pkValues;
                    const pk1Param = ownKeyValue ? {
                        [Constants_1.Constants.DEFAULT_CROSS_PK_OWN_NAME]: ownKeyValue
                    } : {};
                    const pk2Param = refKeyValue ? {
                        [Constants_1.Constants.DEFAULT_CROSS_PK_REF_NAME]: refKeyValue
                    } : {};
                    const params = {
                        ...pk1Param,
                        ...pk2Param,
                        ...currLink.attrsToValues.reduce((acc, curr) => {
                            return { ...acc, [curr.attribute.name]: curr.value };
                        }, {})
                    };
                    const sql = `INSERT INTO ${crossRelation} (${crossRelationAttrsNames.join(", ")})
VALUES (${valuesPlaceholders.join(", ")});`;
                    const newAcc = [...acc, { sql, params }];
                    return newAcc;
                }
                return acc;
            }, []);
            const allSteps = [...fstSteps, ...restSteps];
            console.log(allSteps);
            return allSteps;
        }
        console.log(fstSteps);
        return fstSteps;
    }
}
class Insert {
    static async execute(connection, insertData) {
        const steps = new SQLInsertBuilder(insertData).build();
        await gdmn_db_1.AConnection.executeTransaction({
            connection,
            callback: async (transaction) => {
                for (const { sql, params } of steps) {
                    await connection.execute(transaction, sql, params);
                }
            }
        });
    }
}
exports.Insert = Insert;
//# sourceMappingURL=Insert.js.map