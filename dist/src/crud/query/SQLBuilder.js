"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_orm_1 = require("gdmn-orm");
const SQLTemplates_1 = require("./SQLTemplates");
class SQLBuilder {
    constructor(erModel, dbStructure, query) {
        this._linkAliases = new Map();
        this._fieldAliases = new Map();
        this._params = {};
        this._erModel = erModel;
        this._dbStructure = dbStructure;
        if (query instanceof gdmn_orm_1.EntityQuery) {
            this._query = query;
        }
        else if (typeof query === "object") {
            this._query = gdmn_orm_1.EntityQuery.inspectorToObject(this._erModel, query);
        }
        else {
            this._query = gdmn_orm_1.EntityQuery.deserialize(this._erModel, query);
        }
    }
    static _arrayJoinWithBracket(array, separator) {
        if (array.length === 1) {
            return array.join(separator);
        }
        else if (array.length > 1) {
            return `(${array.join(separator)})`;
        }
        return "";
    }
    static _getAttrAdapter(entity, attribute) {
        let relationName = entity.adapter.relation[0].relationName;
        let fieldName = attribute.name;
        if (attribute.adapter) {
            if (gdmn_orm_1.SetAttribute.isType(attribute)) {
                if (attribute.adapter) {
                    relationName = attribute.adapter.crossRelation;
                    fieldName = attribute.adapter.presentationField || "";
                }
            }
            else if (gdmn_orm_1.DetailAttribute.isType(attribute)) {
                if (attribute.adapter) {
                    relationName = attribute.adapter.masterLinks[0].detailRelation;
                    fieldName = attribute.adapter.masterLinks[0].link2masterField;
                }
            }
            else if (gdmn_orm_1.ScalarAttribute.isType(attribute)) {
                if (attribute.adapter) {
                    relationName = attribute.adapter.relation;
                    fieldName = attribute.adapter.field;
                }
            }
        }
        return { relationName, fieldName };
    }
    static _getPrimaryAttribute(entity) {
        if (entity.pk[0]) {
            return entity.pk[0];
        }
        return entity.attributes[Object.keys(entity.attributes)[0]];
    }
    static _checkInAttrMap(entity, relationName, map) {
        if (map) {
            return Object.values(map).some((value) => {
                for (const key of value.keys()) {
                    if (SQLBuilder._getAttrAdapter(entity, key).relationName === relationName) {
                        return true;
                    }
                }
                return false;
            });
        }
        return false;
    }
    build() {
        this._clearVariables();
        this._createAliases(this._query.link);
        return {
            sql: this._getSelect(),
            params: this._params,
            fieldAliases: this._fieldAliases
        };
    }
    _createAliases(link) {
        const aliasNumber = this._linkAliases.size + 1;
        const queryAlias = link.entity.adapter.relation.reduce((alias, rel, index) => {
            alias[rel.relationName] = index === 0 ? `E$${aliasNumber}` : `E$${aliasNumber}_${Object.keys(alias).length + 1}`;
            return alias;
        }, {});
        this._linkAliases.set(link, queryAlias);
        link.fields
            .filter((field) => !field.link)
            .reduce((aliases, field) => (aliases.set(field, { [field.attribute.name]: `F$${aliases.size + 1}` })), this._fieldAliases);
        link.fields.forEach((field) => {
            if (field.link) {
                if (gdmn_orm_1.SetAttribute.isType(field.attribute)) {
                    if (field.setAttributes) {
                        const fieldAlias = field.setAttributes.reduce((alias, attr) => {
                            alias[attr.name] = `F$${this._fieldAliases.size + 1}_${Object.keys(alias).length + 1}`;
                            return alias;
                        }, {});
                        this._fieldAliases.set(field, fieldAlias);
                    }
                    if (field.attribute.adapter) {
                        const setAdapter = SQLBuilder._getAttrAdapter(field.link.entity, field.attribute);
                        const alias = this._linkAliases.get(link);
                        if (alias) {
                            alias[setAdapter.relationName] = `E$${aliasNumber}_${Object.keys(alias).length + 1}$S`;
                        }
                    }
                }
                this._createAliases(field.link);
            }
        });
    }
    _getSelect() {
        let sql = `SELECT`;
        if (this._query.options && this._query.options.first !== undefined) {
            sql += ` FIRST ${this._addToParams(this._query.options.first)}`;
        }
        if (this._query.options && this._query.options.skip !== undefined) {
            sql += ` SKIP ${this._addToParams(this._query.options.skip)}`;
        }
        sql += `\n${this._makeFields(this._query.link).join(",\n")}`;
        sql += `\n${this._makeFrom(this._query.link)}`;
        const sqlJoin = this._makeJoin(this._query.link).join("\n");
        if (sqlJoin) {
            sql += `\n${sqlJoin}`;
        }
        const sqlWhere = this._makeWhereLinkConditions(this._query.link)
            .concat(this._makeWhereConditions(this._query.options && this._query.options.where))
            .join("\n  AND ");
        if (sqlWhere) {
            sql += `\nWHERE ${sqlWhere}`;
        }
        const sqlOrder = this._makeOrder().join(", ");
        if (sqlOrder) {
            sql += `\nORDER BY ${sqlOrder}`;
        }
        // TODO remove logs in production
        console.log("===================");
        console.log("QUERY:");
        console.log(this._query);
        console.log("SQL:");
        console.log(sql);
        console.log("PARAMS:");
        console.log(this._params);
        console.log("===================");
        return sql;
    }
    _makeFields(link) {
        const fields = link.fields
            .filter((field) => !field.link)
            .map((field) => {
            const attrAdapter = SQLBuilder._getAttrAdapter(link.entity, field.attribute);
            return SQLTemplates_1.SQLTemplates.field(this._getTableAlias(link, attrAdapter.relationName), this._getFieldAlias(field), attrAdapter.fieldName);
        });
        const joinedFields = link.fields.reduce((items, field) => {
            if (field.link) {
                if (field.setAttributes) {
                    field.setAttributes.map((attr) => {
                        const attrAdapter = SQLBuilder._getAttrAdapter(link.entity, attr);
                        return SQLTemplates_1.SQLTemplates.field(this._getTableAlias(link, attrAdapter.relationName), this._getFieldAlias(field, attr), attrAdapter.fieldName);
                    });
                }
                return items.concat(this._makeFields(field.link));
            }
            return items;
        }, []);
        return fields.concat(joinedFields);
    }
    _makeFrom(link) {
        const primaryAttr = SQLBuilder._getPrimaryAttribute(link.entity);
        const primaryAttrAdapter = SQLBuilder._getAttrAdapter(link.entity, primaryAttr);
        const mainRelation = link.entity.adapter.relation[0];
        const from = SQLTemplates_1.SQLTemplates.from(this._getTableAlias(link), mainRelation.relationName);
        const join = link.entity.adapter.relation.reduce((joins, rel, index) => {
            if (index) {
                if (this._isExistInQuery(link, rel.relationName)) {
                    joins.push(SQLTemplates_1.SQLTemplates.join(rel.relationName, this._getTableAlias(link, rel.relationName), this._getPrimaryName(rel.relationName), this._getTableAlias(link), primaryAttrAdapter.fieldName));
                }
            }
            return joins;
        }, []);
        join.unshift(from);
        return join.join("\n");
    }
    _makeJoin(link) {
        const primaryAttr = SQLBuilder._getPrimaryAttribute(link.entity);
        const primaryAttrAdapter = SQLBuilder._getAttrAdapter(link.entity, primaryAttr);
        return link.fields.reduce((joins, field) => {
            if (field.link) {
                const attrAdapter = SQLBuilder._getAttrAdapter(link.entity, field.attribute);
                const nestedPrimaryAttr = SQLBuilder._getPrimaryAttribute(field.link.entity);
                const nestedPrimaryAttrAdapter = SQLBuilder._getAttrAdapter(field.link.entity, nestedPrimaryAttr);
                const mainRelation = field.link.entity.adapter.relation[0];
                if (gdmn_orm_1.SetAttribute.isType(field.attribute)) {
                    joins.push(SQLTemplates_1.SQLTemplates.join(attrAdapter.relationName, this._getTableAlias(link, attrAdapter.relationName), this._getPrimaryName(attrAdapter.relationName), this._getTableAlias(link), primaryAttrAdapter.fieldName));
                    joins.push(SQLTemplates_1.SQLTemplates.join(mainRelation.relationName, this._getTableAlias(field.link, mainRelation.relationName), nestedPrimaryAttrAdapter.fieldName, this._getTableAlias(link, attrAdapter.relationName), this._getPrimaryName(attrAdapter.relationName, 1)));
                }
                else if (gdmn_orm_1.DetailAttribute.isType(field.attribute)) {
                    joins.push(SQLTemplates_1.SQLTemplates.join(mainRelation.relationName, this._getTableAlias(field.link, mainRelation.relationName), attrAdapter.fieldName, this._getTableAlias(link, attrAdapter.relationName), nestedPrimaryAttrAdapter.fieldName));
                }
                else {
                    joins.push(SQLTemplates_1.SQLTemplates.join(mainRelation.relationName, this._getTableAlias(field.link, mainRelation.relationName), nestedPrimaryAttrAdapter.fieldName, this._getTableAlias(link, attrAdapter.relationName), attrAdapter.fieldName));
                }
                field.link.entity.adapter.relation.reduce((relJoins, rel, index) => {
                    if (index && field.link) {
                        if (this._isExistInQuery(field.link, rel.relationName)) {
                            relJoins.push(SQLTemplates_1.SQLTemplates.join(rel.relationName, this._getTableAlias(field.link, rel.relationName), this._getPrimaryName(rel.relationName), this._getTableAlias(field.link), primaryAttrAdapter.fieldName));
                        }
                    }
                    return relJoins;
                }, joins);
                return joins.concat(this._makeJoin(field.link));
            }
            return joins;
        }, []);
    }
    _makeWhereLinkConditions(link) {
        const whereEquals = link.entity.adapter.relation.reduce((equals, rel) => {
            if (rel.selector) {
                if (this._isExistInQuery(link, rel.relationName)) {
                    equals.push(SQLTemplates_1.SQLTemplates.equals(this._getTableAlias(link, rel.relationName), rel.selector.field, this._addToParams(rel.selector.value)));
                }
            }
            return equals;
        }, []);
        return link.fields.reduce((equals, _field) => {
            // if (field.link) {
            //   return equals.concat(this._makeWhereLinkConditions(field.link));
            // }
            return equals;
        }, whereEquals);
    }
    _makeWhereConditions(where) {
        if (!where) {
            return [];
        }
        const { isNull, equals, greater, less, and, or, not } = where;
        let filters = [];
        if (isNull) {
            filters = Object.entries(isNull)
                .reduce((items, [linkAlias, condition]) => {
                const findLink = this._deepFindLinkByAlias(this._query.link, linkAlias);
                const attrAdapter = SQLBuilder._getAttrAdapter(findLink.entity, condition);
                const alias = this._getTableAlias(findLink, attrAdapter.relationName);
                items.push(SQLTemplates_1.SQLTemplates.isNull(alias, attrAdapter.fieldName));
                return items;
            }, filters);
        }
        if (equals) {
            filters = Object.entries(equals)
                .reduce((items, [linkAlias, condition]) => {
                const findLink = this._deepFindLinkByAlias(this._query.link, linkAlias);
                const equalsFilters = [];
                for (const [attribute, value] of condition.entries()) {
                    const attrAdapter = SQLBuilder._getAttrAdapter(findLink.entity, attribute);
                    const alias = this._getTableAlias(findLink, attrAdapter.relationName);
                    equalsFilters.push(SQLTemplates_1.SQLTemplates.equals(alias, attrAdapter.fieldName, this._addToParams(value)));
                }
                const equalsFilter = SQLBuilder._arrayJoinWithBracket(equalsFilters, " AND ");
                if (equalsFilter) {
                    items.push(equalsFilter);
                }
                return items;
            }, filters);
        }
        if (greater) {
            filters = Object.entries(greater)
                .reduce((items, [linkAlias, condition]) => {
                const findLink = this._deepFindLinkByAlias(this._query.link, linkAlias);
                const greaterFilters = [];
                for (const [attribute, value] of condition) {
                    const attrAdapter = SQLBuilder._getAttrAdapter(findLink.entity, attribute);
                    const alias = this._getTableAlias(findLink, attrAdapter.relationName);
                    greaterFilters.push(SQLTemplates_1.SQLTemplates.greater(alias, attrAdapter.fieldName, this._addToParams(value)));
                }
                const greaterFilter = SQLBuilder._arrayJoinWithBracket(greaterFilters, " AND ");
                if (greaterFilter) {
                    items.push(greaterFilter);
                }
                return items;
            }, filters);
        }
        if (less) {
            filters = Object.entries(less)
                .reduce((items, [linkAlias, condition]) => {
                const findLink = this._deepFindLinkByAlias(this._query.link, linkAlias);
                const lessFilters = [];
                for (const [attribute, value] of condition) {
                    const attrAdapter = SQLBuilder._getAttrAdapter(findLink.entity, attribute);
                    const alias = this._getTableAlias(findLink, attrAdapter.relationName);
                    lessFilters.push(SQLTemplates_1.SQLTemplates.less(alias, attrAdapter.fieldName, this._addToParams(value)));
                }
                const lessFilter = SQLBuilder._arrayJoinWithBracket(lessFilters, " AND ");
                if (lessFilter) {
                    items.push(lessFilter);
                }
                return items;
            }, filters);
        }
        const notFilter = SQLBuilder._arrayJoinWithBracket(this._makeWhereConditions(not), " AND ");
        if (notFilter) {
            filters.push(`NOT ${notFilter}`);
        }
        const andFilter = SQLBuilder._arrayJoinWithBracket(this._makeWhereConditions(and), " AND ");
        if (andFilter) {
            filters.push(andFilter);
        }
        const orFilter = SQLBuilder._arrayJoinWithBracket(this._makeWhereConditions(or), " OR ");
        if (orFilter) {
            filters.push(orFilter);
        }
        return filters;
    }
    _makeOrder() {
        if (this._query.options && this._query.options.order) {
            return Object.entries(this._query.options.order).reduce((orders, [linkAlias, order]) => {
                const link = this._deepFindLinkByAlias(this._query.link, linkAlias);
                for (const [key, value] of order) {
                    const attrAdapter = SQLBuilder._getAttrAdapter(link.entity, key);
                    const alias = this._getTableAlias(link, attrAdapter.relationName);
                    orders.push(SQLTemplates_1.SQLTemplates.order(alias, attrAdapter.fieldName, value.toUpperCase()));
                }
                return orders;
            }, []);
        }
        return [];
    }
    _getPrimaryName(relationName, index = 0) {
        const relation = this._dbStructure.findRelation((item) => item.name === relationName);
        if (relation && relation.primaryKey) {
            return relation.primaryKey.fields[relation.primaryKey.fields.length - 1 - index];
        }
        return "";
    }
    _getTableAlias(link, relationName) {
        const alias = this._linkAliases.get(link);
        if (alias) {
            if (relationName) {
                return alias[relationName] || "";
            }
            const mainRel = link.entity.adapter.relation[0];
            return alias[mainRel.relationName] || "";
        }
        return "";
    }
    _getFieldAlias(field, attr) {
        const fieldAlias = this._fieldAliases.get(field);
        if (fieldAlias) {
            return fieldAlias[(attr && attr.name) || Object.keys(fieldAlias)[0]];
        }
        return "";
    }
    _deepFindLinkByAlias(link, alias) {
        if (link.alias === alias) {
            return link;
        }
        for (const field of link.fields) {
            if (field.link) {
                const find = this._deepFindLinkByAlias(field.link, alias);
                if (find) {
                    return find;
                }
            }
        }
        throw new Error("Alias not found");
    }
    _isExistInQuery(link, relationName) {
        const existInFields = link.fields.some((field) => {
            const attrAdapter = SQLBuilder._getAttrAdapter(link.entity, field.attribute);
            return attrAdapter.relationName === relationName;
        });
        if (existInFields) {
            return true;
        }
        const where = this._query.options && this._query.options.where;
        if (where) {
            if (where.isNull && Object.values(where.isNull).some((condition) => (SQLBuilder._getAttrAdapter(link.entity, condition).relationName === relationName))) {
                return true;
            }
            if (SQLBuilder._checkInAttrMap(link.entity, relationName, where.equals)
                || SQLBuilder._checkInAttrMap(link.entity, relationName, where.greater)
                || SQLBuilder._checkInAttrMap(link.entity, relationName, where.less)) {
                return true;
            }
        }
        return SQLBuilder._checkInAttrMap(link.entity, relationName, this._query.options && this._query.options.order);
    }
    _addToParams(value) {
        const length = Object.keys(this._params).length;
        const placeholder = `P$${length + 1}`;
        this._params[placeholder] = value;
        return `:${placeholder}`;
    }
    _clearVariables() {
        this._params = {};
        this._linkAliases.clear();
        this._fieldAliases.clear();
    }
}
exports.SQLBuilder = SQLBuilder;
//# sourceMappingURL=SQLBuilder.js.map