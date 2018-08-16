"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gdmn_db_1 = require("gdmn-db");
const gdmn_orm_1 = require("gdmn-orm");
const Constants_1 = require("../Constants");
const atData_1 = require("./atData");
const gddomains_1 = require("./gddomains");
const GDEntities_1 = require("./GDEntities");
const util_1 = require("./util");
class ERExport2 {
    constructor(connection, transaction, dbStructure, erModel) {
        this._connection = connection;
        this._transaction = transaction;
        this._dbStructure = dbStructure;
        this._erModel = erModel;
    }
    async execute() {
        this._atResult = await atData_1.load(this._connection, this._transaction);
        this._erModel.addSequence(new gdmn_orm_1.Sequence({ name: Constants_1.Constants.GLOBAL_GENERATOR }));
        this._createEntities();
        await new GDEntities_1.GDEntities(this._connection, this._transaction, this._erModel, this._dbStructure, this._getATResult()).add();
        Object.values(this._erModel.entities).forEach((entity) => {
            const forceAdapter = Object.values(this._erModel.entities).some((e) => e.parent === entity);
            this._createAttributes(entity, forceAdapter);
        });
        this._createDetailAttributes();
        this._createSetAttributes();
        return this._erModel;
    }
    _getATResult() {
        if (!this._atResult) {
            throw new Error("atResult is undefined");
        }
        return this._atResult;
    }
    _createEntities() {
        Object.entries(this._getATResult().atRelations).forEach(([atRelationName, atRelation]) => {
            const relation = this._dbStructure.relations[atRelationName];
            const inheritedFk = Object.values(relation.foreignKeys).find((fk) => fk.fields.includes(Constants_1.Constants.DEFAULT_INHERITED_KEY_NAME));
            if (inheritedFk) {
                const refRelation = this._dbStructure.relationByUqConstraint(inheritedFk.constNameUq);
                const refEntities = this._findEntities(refRelation.name);
                if (refEntities.length) {
                    this._erModel.add(this._createEntity(refEntities[0], this._dbStructure.relations[atRelationName], atRelation));
                }
            }
            else {
                this._erModel.add(this._createEntity(undefined, this._dbStructure.relations[atRelationName], atRelation));
            }
        });
    }
    _createEntity(parent, relation, atRelation) {
        const name = atRelation && atRelation.entityName ? atRelation.entityName : relation.name;
        let adapter = atRelation && atRelation.entityName && atRelation.entityName !== relation.name
            ? gdmn_orm_1.relationName2Adapter(relation.name) : undefined;
        const lName = atRelation ? atRelation.lName : {};
        const semCategories = atRelation ? atRelation.semCategories : undefined;
        if (parent) {
            const relName = adapter ? adapter.relation[0].relationName : relation.name;
            adapter = gdmn_orm_1.appendAdapter(parent.adapter, relName);
        }
        const entity = new gdmn_orm_1.Entity({ parent, name, lName, semCategories, adapter });
        if (parent) {
            const entityAttr = entity.add(new gdmn_orm_1.EntityAttribute({
                name: Constants_1.Constants.DEFAULT_INHERITED_KEY_NAME,
                required: true,
                lName: { ru: { name: "Родитель" } },
                entities: [parent]
            }));
            entity.pk.push(entityAttr);
        }
        else {
            entity.add(new gdmn_orm_1.SequenceAttribute({
                name: Constants_1.Constants.DEFAULT_ID_NAME,
                lName: { ru: { name: "Идентификатор" } },
                sequence: this._erModel.sequencies[Constants_1.Constants.GLOBAL_GENERATOR],
                adapter: {
                    relation: entity.adapter ? entity.adapter.relation[entity.adapter.relation.length - 1].relationName : entity.name,
                    field: Constants_1.Constants.DEFAULT_ID_NAME
                }
            }));
        }
        return entity;
    }
    _createAttributes(entity, forceAdapter) {
        const ownAdapterRelation = entity.adapter.relation[entity.adapter.relation.length - 1];
        const relation = this._dbStructure.relations[ownAdapterRelation.relationName];
        const atRelation = this._getATResult().atRelations[relation.name];
        Object.values(relation.relationFields).forEach((relationField) => {
            // ignore lb and rb fields
            if (Object.values(atRelation.relationFields)
                .some((atRf) => (atRf.lbFieldName === relationField.name || atRf.rbFieldName === relationField.name))
                || relationField.name === Constants_1.Constants.DEFAULT_LB_NAME || relationField.name === Constants_1.Constants.DEFAULT_RB_NAME) {
                return;
            }
            if (entity.hasOwnAttribute(relationField.name)) {
                return;
            }
            if (!gdmn_orm_1.hasField(entity.adapter, relation.name, relationField.name)
                && !gdmn_orm_1.systemFields.find(sf => sf === relationField.name)
                && !gdmn_orm_1.isUserDefined(relationField.name)) {
                return;
            }
            if (entity.adapter.relation[0].selector && entity.adapter.relation[0].selector.field === relationField.name) {
                return;
            }
            const atRelationField = atRelation ? atRelation.relationFields[relationField.name] : undefined;
            if (atRelationField && atRelationField.crossTable) {
                return;
            }
            if (atRelationField && atRelationField.masterEntityName) {
                return;
            }
            entity.add(this._createAttribute(relation, relationField, forceAdapter));
        });
        Object.values(relation.unique).forEach((uq) => {
            const attrs = uq.fields.map((field) => {
                let uqAttr = Object.values(entity.attributes).find((attr) => {
                    const attrFieldName = attr.adapter ? attr.adapter.field : attr.name;
                    return attrFieldName === field;
                });
                if (!uqAttr) {
                    uqAttr = entity.attribute(field);
                }
                return uqAttr;
            });
            entity.addUnique(attrs);
        });
    }
    _createDetailAttributes() {
        Object.entries(this._getATResult().atRelations).forEach(([atRelationName, atRelation]) => {
            Object.entries(atRelation.relationFields).forEach(([atRelationFieldName, atRelationField]) => {
                if (atRelationField.masterEntityName) {
                    const relation = this._dbStructure.relations[atRelationName];
                    const relationField = relation.relationFields[atRelationFieldName];
                    const detailEntityName = atRelation && atRelation.entityName ? atRelation.entityName : relation.name;
                    const detailEntity = this._erModel.entity(detailEntityName);
                    const masterEntity = this._erModel.entity(atRelationField.masterEntityName);
                    const name = atRelationField && atRelationField.attrName !== undefined ? atRelationField.attrName : relationField.name;
                    const atField = this._getATResult().atFields[relationField.fieldSource];
                    const fieldSource = this._dbStructure.fields[relationField.fieldSource];
                    const required = relationField.notNull || fieldSource.notNull;
                    const lName = atRelationField ? atRelationField.lName : (atField ? atField.lName : {});
                    const detailAdapter = detailEntity.name !== name ? {
                        masterLinks: [{
                                detailRelation: detailEntity.name,
                                link2masterField: relationField.name
                            }]
                    } : undefined;
                    masterEntity.add(new gdmn_orm_1.DetailAttribute({
                        name, lName, required, entities: [detailEntity],
                        semCategories: atRelationField ? atRelationField.semCategories : [],
                        adapter: detailAdapter
                    }));
                }
            });
        });
    }
    /**
     * Looking for cross-tables and construct set attributes.
     *
     * 1. Cross tables are those whose PK consists of minimum 2 fields.
     * 2. First field of cross table PK must be a FK referencing owner table.
     * 3. Second field of cross table PK must be a FK referencing reference table.
     * 4. Owner in this context is an Entity(s) a Set attribute belongs to.
     * 5. Reference in this context is an Entity(s) a Set attribute contains objects of which type.
     */
    _createSetAttributes() {
        Object.entries(this._dbStructure.relations).forEach(([crossName, crossRelation]) => {
            if (crossRelation.primaryKey && crossRelation.primaryKey.fields.length >= 2) {
                const fkOwner = Object
                    .values(crossRelation.foreignKeys)
                    .find((fk) => fk.fields.length === 1 && fk.fields[0] === crossRelation.primaryKey.fields[0]);
                if (!fkOwner)
                    return;
                const fkReference = Object
                    .values(crossRelation.foreignKeys)
                    .find((fk) => fk.fields.length === 1 && fk.fields[0] === crossRelation.primaryKey.fields[1]);
                if (!fkReference)
                    return;
                const relOwner = this._dbStructure.relationByUqConstraint(fkOwner.constNameUq);
                const atRelOwner = this._getATResult().atRelations[relOwner.name];
                if (!atRelOwner)
                    return;
                let entitiesOwner;
                const crossRelationAdapter = GDEntities_1.GDEntities.CROSS_RELATIONS_ADAPTERS[crossName];
                if (crossRelationAdapter) {
                    entitiesOwner = this._findEntities(crossRelationAdapter.owner, crossRelationAdapter.selector ?
                        [crossRelationAdapter.selector] : undefined);
                }
                else {
                    entitiesOwner = this._findEntities(relOwner.name);
                }
                if (!entitiesOwner.length) {
                    return;
                }
                const relReference = this._dbStructure.relationByUqConstraint(fkReference.constNameUq);
                let cond;
                const atSetField = Object.entries(atRelOwner.relationFields).find((rf) => rf[1].crossTable === crossName);
                const atSetFieldSource = atSetField ? this._getATResult().atFields[atSetField[1].fieldSource] : undefined;
                if (atSetFieldSource && atSetFieldSource.setTable === relReference.name && atSetFieldSource.setCondition) {
                    cond = gdmn_orm_1.condition2Selectors(atSetFieldSource.setCondition);
                }
                const referenceEntities = this._findEntities(relReference.name, cond);
                if (!referenceEntities.length) {
                    return;
                }
                const setField = atSetField ? relOwner.relationFields[atSetField[0]] : undefined;
                const setFieldSource = setField ? this._dbStructure.fields[setField.fieldSource] : undefined;
                const atCrossRelation = this._getATResult().atRelations[crossName];
                entitiesOwner.forEach((entity) => {
                    if (!Object.values(entity.attributes).find((attr) => (attr instanceof gdmn_orm_1.SetAttribute) && !!attr.adapter && attr.adapter.crossRelation === crossName)) {
                        // for custom set field
                        let name = atSetField && atSetField[0] || crossName;
                        const setAdapter = { crossRelation: crossName };
                        if (atSetField) {
                            const [a, atSetRelField] = atSetField;
                            name = atSetRelField && atSetRelField.attrName || name;
                            if (a !== name) {
                                setAdapter.presentationField = a;
                            }
                        }
                        const setAttr = new gdmn_orm_1.SetAttribute({
                            name,
                            lName: atSetField ? atSetField[1].lName : (atCrossRelation ? atCrossRelation.lName : { en: { name: crossName } }),
                            required: (!!setField && setField.notNull) || (!!setFieldSource && setFieldSource.notNull),
                            entities: referenceEntities,
                            presLen: (setFieldSource && setFieldSource.fieldType === gdmn_db_1.FieldType.VARCHAR) ? setFieldSource.fieldLength : 0,
                            semCategories: atCrossRelation.semCategories,
                            adapter: setAdapter
                        });
                        Object.entries(crossRelation.relationFields).forEach(([addName, addField]) => {
                            if (!crossRelation.primaryKey.fields.find(f => f === addName)) {
                                setAttr.add(this._createAttribute(crossRelation, addField, false));
                            }
                        });
                        entity.add(setAttr);
                    }
                });
            }
        });
    }
    _createAttribute(relation, relationField, forceAdapter) {
        const atRelation = this._getATResult().atRelations[relation.name];
        const atRelationField = atRelation ? atRelation.relationFields[relationField.name] : undefined;
        const atField = this._getATResult().atFields[relationField.fieldSource];
        const fieldSource = this._dbStructure.fields[relationField.fieldSource];
        const name = atRelationField && atRelationField.attrName !== undefined ? atRelationField.attrName : relationField.name;
        const adapter = (atRelationField && atRelationField.attrName !== undefined) || forceAdapter ? {
            relation: relation.name,
            field: relationField.name
        } : undefined;
        const required = relationField.notNull || fieldSource.notNull;
        const defaultValueSource = relationField.defaultSource || fieldSource.defaultSource;
        const lName = atRelationField ? atRelationField.lName : (atField ? atField.lName : {});
        const semCategories = atRelationField ? atRelationField.semCategories : [];
        const createDomainFunc = gddomains_1.gdDomains[relationField.fieldSource];
        if (createDomainFunc) {
            return createDomainFunc(name, lName, adapter);
        }
        // numeric and decimal
        if (fieldSource.fieldSubType === 1 || fieldSource.fieldSubType === 2) {
            const factor = Math.pow(10, Math.abs(fieldSource.fieldScale));
            let range;
            switch (fieldSource.fieldType) {
                case gdmn_db_1.FieldType.SMALL_INTEGER:
                    range = util_1.check2IntRange(fieldSource.validationSource, {
                        min: gdmn_orm_1.MIN_16BIT_INT * factor,
                        max: gdmn_orm_1.MAX_16BIT_INT * factor
                    });
                    break;
                case gdmn_db_1.FieldType.INTEGER:
                    range = util_1.check2IntRange(fieldSource.validationSource, {
                        min: gdmn_orm_1.MIN_32BIT_INT * factor,
                        max: gdmn_orm_1.MAX_32BIT_INT * factor
                    });
                    break;
                case gdmn_db_1.FieldType.BIG_INTEGER:
                    range = util_1.check2IntRange(fieldSource.validationSource, {
                        min: gdmn_orm_1.MIN_64BIT_INT * factor,
                        max: gdmn_orm_1.MAX_64BIT_INT * factor
                    });
                    break;
            }
            if (range) {
                return new gdmn_orm_1.NumericAttribute({
                    name, lName, required, semCategories, adapter,
                    precision: fieldSource.fieldPrecision,
                    scale: Math.abs(fieldSource.fieldScale),
                    minValue: range.minValue, maxValue: range.maxValue,
                    defaultValue: util_1.default2Float(defaultValueSource)
                });
            }
        }
        switch (fieldSource.fieldType) {
            case gdmn_db_1.FieldType.SMALL_INTEGER: {
                if (util_1.isCheckForBoolean(fieldSource.validationSource)) {
                    const defaultValue = util_1.default2Boolean(defaultValueSource);
                    return new gdmn_orm_1.BooleanAttribute({ name, lName, required, defaultValue, semCategories, adapter });
                }
                const { minValue, maxValue } = util_1.check2IntRange(fieldSource.validationSource, {
                    min: gdmn_orm_1.MIN_16BIT_INT,
                    max: gdmn_orm_1.MAX_16BIT_INT
                });
                const defaultValue = util_1.default2Int(defaultValueSource);
                return new gdmn_orm_1.IntegerAttribute({ name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter });
            }
            case gdmn_db_1.FieldType.BIG_INTEGER: {
                const { minValue, maxValue } = util_1.check2IntRange(fieldSource.validationSource, {
                    min: gdmn_orm_1.MIN_64BIT_INT,
                    max: gdmn_orm_1.MAX_64BIT_INT
                });
                const defaultValue = util_1.default2Int(defaultValueSource);
                return new gdmn_orm_1.IntegerAttribute({ name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter });
            }
            case gdmn_db_1.FieldType.INTEGER: {
                const fieldName = adapter ? adapter.field : name;
                const fk = Object.values(relation.foreignKeys).find((fk) => fk.fields.includes(fieldName));
                if (fk && fk.fields.length) {
                    const refRelationName = this._dbStructure.relationByUqConstraint(fk.constNameUq).name;
                    const cond = atField && atField.refCondition ? gdmn_orm_1.condition2Selectors(atField.refCondition) : undefined;
                    const refEntities = this._findEntities(refRelationName, cond);
                    if (!refEntities.length) {
                        console.warn(`${relation.name}.${relationField.name}: no entities for table ${refRelationName}${cond ? ", condition: " + JSON.stringify(cond) : ""}`);
                    }
                    if (atRelationField && atRelationField.isParent) {
                        let parentAttrAdapter;
                        const lbField = atRelationField.lbFieldName || Constants_1.Constants.DEFAULT_LB_NAME;
                        const rbField = atRelationField.rbFieldName || Constants_1.Constants.DEFAULT_RB_NAME;
                        if (adapter) {
                            parentAttrAdapter = { ...adapter, lbField, rbField };
                        }
                        else if (atRelationField.lbFieldName || atRelationField.rbFieldName) {
                            parentAttrAdapter = {
                                relation: relation.name,
                                field: relationField.name,
                                lbField, rbField
                            };
                        }
                        return new gdmn_orm_1.ParentAttribute({ name, lName, entities: refEntities, semCategories, adapter: parentAttrAdapter });
                    }
                    return new gdmn_orm_1.EntityAttribute({ name, lName, required, entities: refEntities, semCategories, adapter });
                }
                else {
                    const { minValue, maxValue } = util_1.check2IntRange(fieldSource.validationSource, {
                        min: gdmn_orm_1.MIN_32BIT_INT,
                        max: gdmn_orm_1.MAX_32BIT_INT
                    });
                    const defaultValue = util_1.default2Int(defaultValueSource);
                    return new gdmn_orm_1.IntegerAttribute({
                        name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter
                    });
                }
            }
            case gdmn_db_1.FieldType.CHAR:
            case gdmn_db_1.FieldType.VARCHAR: {
                if (fieldSource.fieldLength === 1) {
                    const values = util_1.check2Enum(fieldSource.validationSource);
                    if (values.length) {
                        const dif = atField.numeration ? atField.numeration.split("#13#10") : [];
                        const mapValues = dif.reduce((map, item) => {
                            const [key, value] = item.split("=");
                            map[key] = value;
                            return map;
                        }, {});
                        const defaultValue = util_1.default2String(defaultValueSource);
                        return new gdmn_orm_1.EnumAttribute({
                            name, lName, required,
                            values: values.map((value) => ({
                                value,
                                lName: mapValues[value] ? { ru: { name: mapValues[value] } } : undefined
                            })),
                            defaultValue, semCategories, adapter
                        });
                    }
                }
                const minLength = util_1.check2StrMin(fieldSource.validationSource);
                const defaultValue = util_1.default2String(defaultValueSource);
                return new gdmn_orm_1.StringAttribute({
                    name, lName, required, minLength, maxLength: fieldSource.fieldLength,
                    defaultValue, autoTrim: true, semCategories, adapter
                });
            }
            case gdmn_db_1.FieldType.TIMESTAMP: {
                const { minValue, maxValue } = util_1.check2TimestampRange(fieldSource.validationSource);
                const defaultValue = util_1.default2Timestamp(defaultValueSource);
                return new gdmn_orm_1.TimeStampAttribute({
                    name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter
                });
            }
            case gdmn_db_1.FieldType.DATE: {
                const { minValue, maxValue } = util_1.check2DateRange(fieldSource.validationSource);
                const defaultValue = util_1.default2Date(defaultValueSource);
                return new gdmn_orm_1.DateAttribute({ name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter });
            }
            case gdmn_db_1.FieldType.TIME: {
                const { minValue, maxValue } = util_1.check2TimeRange(fieldSource.validationSource);
                const defaultValue = util_1.default2Time(defaultValueSource);
                return new gdmn_orm_1.TimeAttribute({ name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter });
            }
            case gdmn_db_1.FieldType.FLOAT:
            case gdmn_db_1.FieldType.DOUBLE: {
                const { minValue, maxValue } = util_1.check2NumberRange(fieldSource.validationSource);
                const defaultValue = util_1.default2Float(defaultValueSource);
                return new gdmn_orm_1.FloatAttribute({ name, lName, required, minValue, maxValue, defaultValue, semCategories, adapter });
            }
            case gdmn_db_1.FieldType.BLOB: {
                if (fieldSource.fieldSubType === 1) {
                    const minLength = util_1.check2StrMin(fieldSource.validationSource);
                    const defaultValue = util_1.default2String(defaultValueSource);
                    return new gdmn_orm_1.StringAttribute({
                        name, lName, required, minLength: minLength,
                        defaultValue, autoTrim: false, semCategories, adapter
                    });
                }
                return new gdmn_orm_1.BlobAttribute({ name, lName, required, semCategories, adapter });
            }
            default:
                throw new Error(`Unknown data type ${fieldSource}=${fieldSource.fieldType} for field ${relation.name}.${name}`);
        }
    }
    _findEntities(relationName, selectors = []) {
        const found = Object.values(this._erModel.entities).reduce((p, entity) => {
            if (entity.adapter) {
                entity.adapter.relation.forEach((rel) => {
                    if (rel.relationName === relationName && !rel.weak) {
                        if (rel.selector && selectors.length) {
                            if (selectors.find((s) => s.field === rel.selector.field && s.value === rel.selector.value)) {
                                p.push(entity);
                            }
                        }
                        else {
                            p.push(entity);
                        }
                    }
                });
            }
            return p;
        }, []);
        while (found.length) {
            const descendant = found.findIndex((d) => !!found.find((a) => a !== d && d.hasAncestor(a)));
            if (descendant === -1)
                break;
            found.splice(descendant, 1);
        }
        return found;
    }
}
exports.ERExport2 = ERExport2;
//# sourceMappingURL=ERExport2.js.map