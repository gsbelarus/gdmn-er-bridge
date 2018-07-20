"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var gdmn_db_1 = require("gdmn-db");
var gdmn_nlp_1 = require("gdmn-nlp");
var gdmn_orm_1 = require("gdmn-orm");
var gddomains_1 = require("../gddomains");
var util_1 = require("../util");
var atdata_1 = require("./atdata");
var document_1 = require("./document");
var gdtables_1 = require("./gdtables");
var idAttrName = "ID";
function erExport(dbs, connection, transaction, erModel) {
    return __awaiter(this, void 0, void 0, function () {
        function findEntities(relationName, selectors) {
            if (selectors === void 0) { selectors = []; }
            var found = Object.entries(erModel.entities).reduce(function (p, e) {
                if (e[1].adapter) {
                    e[1].adapter.relation.forEach(function (r) {
                        if (r.relationName === relationName && !r.weak) {
                            if (r.selector && selectors.length) {
                                if (selectors.find(function (s) { return s.field === r.selector.field && s.value === r.selector.value; })) {
                                    p.push(e[1]);
                                }
                            }
                            else {
                                p.push(e[1]);
                            }
                        }
                    });
                }
                return p;
            }, []);
            while (found.length) {
                var descendant = found.findIndex(function (d) { return !!found.find(function (a) { return a !== d && d.hasAncestor(a); }); });
                if (descendant === -1)
                    break;
                found.splice(descendant, 1);
            }
            return found;
        }
        function createEntity(parent, adapter, abstract, entityName, lName, semCategories, attributes) {
            if (semCategories === void 0) { semCategories = []; }
            if (!abstract) {
                var found = Object.entries(erModel.entities).find(function (e) { return !e[1].isAbstract && gdmn_orm_1.sameAdapter(adapter, e[1].adapter); });
                if (found) {
                    return found[1];
                }
            }
            var relation = adapter.relation.filter(function (r) { return !r.weak; }).reverse()[0];
            if (!relation || !relation.relationName) {
                throw new Error("Invalid entity adapter");
            }
            var setEntityName = gdmn_orm_1.adjustName(entityName ? entityName : relation.relationName);
            var atRelation = atrelations[relation.relationName];
            var fake = gdmn_orm_1.relationName2Adapter(setEntityName);
            var entity = new gdmn_orm_1.Entity(parent, setEntityName, lName ? lName : (atRelation ? atRelation.lName : {}), !!abstract, semCategories, JSON.stringify(adapter) !== JSON.stringify(fake) ? adapter : undefined);
            if (!parent) {
                entity.add(new gdmn_orm_1.SequenceAttribute(idAttrName, { ru: { name: "Идентификатор" } }, GDGUnique));
            }
            if (attributes) {
                attributes.forEach(function (attr) { return entity.add(attr); });
            }
            return erModel.add(entity);
        }
        function createDocument(id, ruid, parent_ruid, name, className, hr, lr) {
            var setHR = hr ? hr
                : id === 800300 ? "BN_BANKSTATEMENT"
                    : id === 800350 ? "BN_BANKCATALOGUE"
                        : "";
            var setLR = lr ? lr
                : id === 800300 ? "BN_BANKSTATEMENTLINE"
                    : id === 800350 ? "BN_BANKCATALOGUELINE"
                        : "";
            var parent = documentClasses[parent_ruid] && documentClasses[parent_ruid].header ? documentClasses[parent_ruid].header
                : documentABC[className] ? documentABC[className]
                    : TgdcDocument;
            if (!parent) {
                throw new Error("Unknown doc type " + parent_ruid + " of " + className);
            }
            var headerAdapter = gdmn_orm_1.appendAdapter(parent.adapter, setHR);
            headerAdapter.relation[0].selector = { field: "DOCUMENTTYPEKEY", value: id };
            var header = createEntity(parent, headerAdapter, false, "DOC_" + ruid + "_" + setHR, { ru: { name: name } });
            documentClasses[ruid] = { header: header };
            if (setLR) {
                var lineParent = documentClasses[parent_ruid] && documentClasses[parent_ruid].line ? documentClasses[parent_ruid].line
                    : documentABC[className] ? documentABC[className]
                        : TgdcDocument;
                if (!lineParent) {
                    throw new Error("Unknown doc type " + parent_ruid + " of " + className);
                }
                var lineAdapter = gdmn_orm_1.appendAdapter(lineParent.adapter, setLR);
                lineAdapter.relation[0].selector = { field: "DOCUMENTTYPEKEY", value: id };
                var line = createEntity(lineParent, lineAdapter, false, "LINE_" + ruid + "_" + setLR, { ru: { name: "\u041F\u043E\u0437\u0438\u0446\u0438\u044F: " + name } });
                line.add(new gdmn_orm_1.ParentAttribute("PARENT", { ru: { name: "Шапка документа" } }, [header]));
                documentClasses[ruid] = __assign({}, documentClasses[ruid], { line: line });
                var masterLinks = [
                    {
                        detailRelation: "GD_DOCUMENT",
                        link2masterField: "PARENT"
                    }
                ];
                if (dbs.relations[setLR] && dbs.relations[setLR].relationFields["MASTERKEY"]) {
                    masterLinks.push({
                        detailRelation: setLR,
                        link2masterField: "MASTERKEY"
                    });
                }
                header.add(new gdmn_orm_1.DetailAttribute(line.name, line.lName, false, [line], [], { masterLinks: masterLinks }));
            }
        }
        function recursInherited(parentRelation, parentEntity) {
            dbs.forEachRelation(function (inherited) {
                if (Object.entries(inherited.foreignKeys).find(function (_a) {
                    var f = _a[1];
                    return f.fields.join() === inherited.primaryKey.fields.join()
                        && dbs.relationByUqConstraint(f.constNameUq) === parentRelation[parentRelation.length - 1];
                })) {
                    var newParent = parentRelation.concat([inherited]);
                    var parentAdapter = parentEntity ? parentEntity.adapter
                        : gdmn_orm_1.relationNames2Adapter(parentRelation.map(function (p) { return p.name; }));
                    recursInherited(newParent, createEntity(parentEntity, gdmn_orm_1.appendAdapter(parentAdapter, inherited.name), false, inherited.name, atrelations[inherited.name] ? atrelations[inherited.name].lName : {}));
                }
            }, true);
        }
        function createAttribute(r, rf, atRelationField, attrName, semCategories, adapter) {
            var attributeName = gdmn_orm_1.adjustName(attrName);
            var atField = atfields[rf.fieldSource];
            var fieldSource = dbs.fields[rf.fieldSource];
            var required = rf.notNull || fieldSource.notNull;
            var defaultValue = rf.defaultSource || fieldSource.defaultSource;
            var lName = atRelationField ? atRelationField.lName : (atField ? atField.lName : {});
            var createDomainFunc = gddomains_1.gdDomains[rf.fieldSource];
            if (createDomainFunc) {
                return createDomainFunc(attributeName, lName, adapter);
            }
            // numeric and decimal
            if (fieldSource.fieldSubType === 1 || fieldSource.fieldSubType === 2) {
                var factor = Math.pow(10, Math.abs(fieldSource.fieldScale));
                var range = void 0;
                switch (fieldSource.fieldType) {
                    case gdmn_db_1.FieldType.SMALL_INTEGER:
                        range = util_1.check2NumberRange(fieldSource.validationSource, {
                            min: gdmn_orm_1.MIN_16BIT_INT * factor,
                            max: gdmn_orm_1.MAX_16BIT_INT * factor
                        });
                        break;
                    case gdmn_db_1.FieldType.INTEGER:
                        range = util_1.check2NumberRange(fieldSource.validationSource, {
                            min: gdmn_orm_1.MIN_32BIT_INT * factor,
                            max: gdmn_orm_1.MAX_32BIT_INT * factor
                        });
                        break;
                    case gdmn_db_1.FieldType.BIG_INTEGER:
                        range = util_1.check2NumberRange(fieldSource.validationSource, {
                            min: gdmn_orm_1.MIN_64BIT_INT * factor,
                            max: gdmn_orm_1.MAX_64BIT_INT * factor
                        });
                        break;
                }
                if (range) {
                    return new gdmn_orm_1.NumericAttribute(attributeName, lName, required, fieldSource.fieldPrecision, Math.abs(fieldSource.fieldScale), range.minValue, range.maxValue, util_1.default2Number(defaultValue), semCategories, adapter);
                }
            }
            switch (fieldSource.fieldType) {
                case gdmn_db_1.FieldType.INTEGER: {
                    var fk = Object.entries(r.foreignKeys).find(function (_a) {
                        var f = _a[1];
                        return !!f.fields.find(function (fld) { return fld === attributeName; });
                    });
                    if (fk && fk[1].fields.length === 1) {
                        var refRelationName = dbs.relationByUqConstraint(fk[1].constNameUq).name;
                        var cond = atField && atField.refCondition ? gdmn_orm_1.condition2Selectors(atField.refCondition) : undefined;
                        var refEntities = findEntities(refRelationName, cond);
                        if (!refEntities.length) {
                            console.warn(r.name + "." + rf.name + ": no entities for table " + refRelationName + (cond ? ", condition: " + JSON.stringify(cond) : ""));
                        }
                        return new gdmn_orm_1.EntityAttribute(attributeName, lName, required, refEntities, semCategories, adapter);
                    }
                    else {
                        var iRange = util_1.check2NumberRange(fieldSource.validationSource, { min: gdmn_orm_1.MIN_32BIT_INT, max: gdmn_orm_1.MAX_32BIT_INT });
                        return new gdmn_orm_1.IntegerAttribute(attributeName, lName, required, iRange.minValue, iRange.maxValue, util_1.default2Int(defaultValue), semCategories, adapter);
                    }
                }
                case gdmn_db_1.FieldType.CHAR:
                case gdmn_db_1.FieldType.VARCHAR: {
                    if (fieldSource.fieldLength === 1) {
                        var values = util_1.check2Enum(fieldSource.validationSource);
                        if (values.length) {
                            var dif = atField.numeration ? atField.numeration.split("#13#10") : [];
                            var mapValues_1 = dif.reduce(function (map, item) {
                                var _a = item.split("="), key = _a[0], value = _a[1];
                                map[key] = value;
                                return map;
                            }, {});
                            return new gdmn_orm_1.EnumAttribute(attributeName, lName, required, values.map(function (value) { return ({
                                value: value,
                                lName: mapValues_1[value] ? { ru: { name: mapValues_1[value] } } : undefined
                            }); }), util_1.default2String(defaultValue), semCategories, adapter);
                        }
                    }
                    var minLength = util_1.check2StrMin(fieldSource.validationSource);
                    return new gdmn_orm_1.StringAttribute(attributeName, lName, required, minLength, fieldSource.fieldLength, util_1.default2String(defaultValue), true, undefined, semCategories, adapter);
                }
                case gdmn_db_1.FieldType.TIMESTAMP:
                    var tsRange = util_1.check2TimestampRange(fieldSource.validationSource);
                    return new gdmn_orm_1.TimeStampAttribute(attributeName, lName, required, tsRange.minValue, tsRange.maxValue, util_1.default2Timestamp(defaultValue), semCategories, adapter);
                case gdmn_db_1.FieldType.DATE:
                    var dRange = util_1.check2DateRange(fieldSource.validationSource);
                    return new gdmn_orm_1.DateAttribute(attributeName, lName, required, dRange.minValue, dRange.maxValue, util_1.default2Date(defaultValue), semCategories, adapter);
                case gdmn_db_1.FieldType.TIME:
                    var tRange = util_1.check2TimeRange(fieldSource.validationSource);
                    return new gdmn_orm_1.TimeAttribute(attributeName, lName, required, tRange.minValue, tRange.maxValue, util_1.default2Time(defaultValue), semCategories, adapter);
                case gdmn_db_1.FieldType.FLOAT:
                case gdmn_db_1.FieldType.DOUBLE:
                    var fRange = util_1.check2NumberRange(fieldSource.validationSource);
                    return new gdmn_orm_1.FloatAttribute(attributeName, lName, required, fRange.minValue, fRange.maxValue, util_1.default2Number(defaultValue), semCategories, adapter);
                case gdmn_db_1.FieldType.SMALL_INTEGER:
                    if (util_1.isCheckForBoolean(fieldSource.validationSource)) {
                        return new gdmn_orm_1.BooleanAttribute(attributeName, lName, required, util_1.default2Boolean(defaultValue), semCategories, adapter);
                    }
                    var siRange = util_1.check2NumberRange(fieldSource.validationSource, { min: gdmn_orm_1.MIN_16BIT_INT, max: gdmn_orm_1.MAX_16BIT_INT });
                    return new gdmn_orm_1.IntegerAttribute(attributeName, lName, required, siRange.minValue, siRange.maxValue, util_1.default2Int(defaultValue), semCategories, adapter);
                case gdmn_db_1.FieldType.BIG_INTEGER:
                    var biRange = util_1.check2NumberRange(fieldSource.validationSource, { min: gdmn_orm_1.MIN_64BIT_INT, max: gdmn_orm_1.MAX_64BIT_INT });
                    return new gdmn_orm_1.IntegerAttribute(attributeName, lName, required, biRange.minValue, biRange.maxValue, util_1.default2Int(defaultValue), semCategories, adapter);
                case gdmn_db_1.FieldType.BLOB:
                    if (fieldSource.fieldSubType === 1) {
                        return new gdmn_orm_1.StringAttribute(attributeName, lName, required, 0, undefined, util_1.default2String(defaultValue), false, undefined, semCategories, adapter);
                    }
                    else {
                        return new gdmn_orm_1.BlobAttribute(attributeName, lName, required, semCategories, adapter);
                    }
                default:
                    throw new Error("Unknown data type " + fieldSource + "=" + fieldSource.fieldType + " for field " + r.name + "." + attributeName);
            }
        }
        function createAttributes(entity) {
            var relations = entity.adapter.relation.map(function (rn) { return dbs.relations[rn.relationName]; });
            relations.forEach(function (r) {
                if (!r || !r.primaryKey)
                    return;
                var atRelation = atrelations[r.name];
                Object.entries(r.relationFields).forEach(function (_a) {
                    var fn = _a[0], rf = _a[1];
                    if (r.primaryKey.fields.find(function (f) { return f === fn; }))
                        return;
                    if (fn === "LB" || fn === "RB")
                        return;
                    if (entity.hasAttribute(fn))
                        return;
                    if (!gdmn_orm_1.hasField(entity.adapter, r.name, fn)
                        && !gdmn_orm_1.systemFields.find(function (sf) { return sf === fn; })
                        && !gdmn_orm_1.isUserDefined(fn)) {
                        return;
                    }
                    if (entity.adapter.relation[0].selector && entity.adapter.relation[0].selector.field === fn) {
                        return;
                    }
                    var atRelationField = atRelation ? atRelation.relationFields[fn] : undefined;
                    if (atRelationField && atRelationField.crossTable)
                        return;
                    var attr = createAttribute(r, rf, atRelationField, entity.hasAttribute(fn) ? r.name + "." + fn : fn, atRelationField ? atRelationField.semCategories : [], relations.length > 1 ? { relation: r.name, field: fn } : undefined);
                    if (attr) {
                        entity.add(attr);
                    }
                });
                Object.entries(r.unique).forEach(function (uq) {
                    entity.addUnique(uq[1].fields.map(function (f) { return entity.attribute(f); }));
                });
            });
        }
        var _a, atfields, atrelations, crossRelationsAdapters, abstractBaseRelations, GDGUnique, Folder, Company, Department, Person, Employee, Group, companyAccount, TgdcDocument, TgdcDocumentAdapter, documentABC, documentClasses;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, atdata_1.load(connection, transaction)];
                case 1:
                    _a = _b.sent(), atfields = _a.atfields, atrelations = _a.atrelations;
                    crossRelationsAdapters = {
                        "GD_CONTACTLIST": {
                            owner: "GD_CONTACT",
                            selector: {
                                field: "CONTACTTYPE",
                                value: 1
                            }
                        }
                    };
                    abstractBaseRelations = {
                        "GD_CONTACT": true
                    };
                    GDGUnique = erModel.addSequence(new gdmn_orm_1.Sequence("GD_G_UNIQUE"));
                    erModel.addSequence(new gdmn_orm_1.Sequence("Offset", { sequence: "GD_G_OFFSET" }));
                    createEntity(undefined, gdmn_orm_1.relationName2Adapter("TEST")); // TODO
                    /**
                     * Простейший случай таблицы. Никаких ссылок.
                     */
                    createEntity(undefined, gdmn_orm_1.relationName2Adapter("WG_HOLIDAY"));
                    /**
                     * Административно-территориальная единица.
                     * Тут исключительно для иллюстрации типа данных Перечисление.
                     */
                    createEntity(undefined, gdmn_orm_1.relationName2Adapter("GD_PLACE"), false, undefined, undefined, [gdmn_nlp_1.SemCategory.Place], [
                        new gdmn_orm_1.EnumAttribute("PLACETYPE", { ru: { name: "Тип" } }, true, [
                            {
                                value: "Область"
                            },
                            {
                                value: "Район"
                            }
                        ], "Область")
                    ]);
                    Folder = createEntity(undefined, {
                        relation: [{
                                relationName: "GD_CONTACT",
                                selector: {
                                    field: "CONTACTTYPE",
                                    value: 0
                                },
                                fields: [
                                    "PARENT",
                                    "NAME"
                                ]
                            }]
                    }, false, "Folder", { ru: { name: "Папка" } });
                    Folder.add(new gdmn_orm_1.ParentAttribute("PARENT", { ru: { name: "Входит в папку" } }, [Folder]));
                    Company = createEntity(undefined, {
                        relation: [
                            {
                                relationName: "GD_CONTACT",
                                selector: {
                                    field: "CONTACTTYPE",
                                    value: 3
                                }
                            },
                            {
                                relationName: "GD_COMPANY"
                            },
                            {
                                relationName: "GD_COMPANYCODE",
                                weak: true
                            }
                        ],
                        refresh: true
                    }, false, "Company", { ru: { name: "Организация" } }, [gdmn_nlp_1.SemCategory.Company], [
                        new gdmn_orm_1.ParentAttribute("PARENT", { ru: { name: "Входит в папку" } }, [Folder]),
                        new gdmn_orm_1.StringAttribute("NAME", { ru: { name: "Краткое наименование" } }, true, undefined, 60, undefined, true, undefined)
                    ]);
                    createEntity(Company, {
                        relation: [
                            {
                                relationName: "GD_CONTACT",
                                selector: {
                                    field: "CONTACTTYPE",
                                    value: 3
                                }
                            },
                            {
                                relationName: "GD_COMPANY"
                            },
                            {
                                relationName: "GD_COMPANYCODE",
                                weak: true
                            },
                            {
                                relationName: "GD_OURCOMPANY"
                            }
                        ],
                        refresh: true
                    }, false, "OurCompany", { ru: { name: "Рабочая организация" } });
                    /**
                     * Банк является частным случаем компании (наследуется от компании).
                     * Все атрибуты компании являются и атрибутами банка и не нуждаются
                     * в повторном определении, за тем исключением, если мы хотим что-то
                     * поменять в параметрах атрибута.
                     */
                    createEntity(Company, {
                        relation: [
                            {
                                relationName: "GD_CONTACT",
                                selector: {
                                    field: "CONTACTTYPE",
                                    value: 5
                                }
                            },
                            {
                                relationName: "GD_COMPANY"
                            },
                            {
                                relationName: "GD_COMPANYCODE",
                                weak: true
                            },
                            {
                                relationName: "GD_BANK"
                            }
                        ],
                        refresh: true
                    }, false, "Bank", { ru: { name: "Банк" } });
                    Department = createEntity(undefined, {
                        relation: [{
                                relationName: "GD_CONTACT",
                                selector: {
                                    field: "CONTACTTYPE",
                                    value: 4
                                }
                            }]
                    }, false, "Department", { ru: { name: "Подразделение" } });
                    Department.add(new gdmn_orm_1.ParentAttribute("PARENT", { ru: { name: "Входит в организацию (подразделение)" } }, [Company, Department]));
                    Department.add(new gdmn_orm_1.StringAttribute("NAME", { ru: { name: "Наименование" } }, true, undefined, 60, undefined, true, undefined));
                    Person = createEntity(undefined, {
                        relation: [
                            {
                                relationName: "GD_CONTACT",
                                selector: {
                                    field: "CONTACTTYPE",
                                    value: 2
                                }
                            },
                            {
                                relationName: "GD_PEOPLE"
                            }
                        ],
                        refresh: true
                    }, false, "Person", { ru: { name: "Физическое лицо" } });
                    Person.add(new gdmn_orm_1.ParentAttribute("PARENT", { ru: { name: "Входит в папку" } }, [Folder]));
                    Person.add(new gdmn_orm_1.StringAttribute("NAME", { ru: { name: "ФИО" } }, true, undefined, 60, undefined, true, undefined));
                    Employee = createEntity(Person, {
                        relation: [
                            {
                                relationName: "GD_CONTACT",
                                selector: {
                                    field: "CONTACTTYPE",
                                    value: 2
                                }
                            },
                            {
                                relationName: "GD_PEOPLE"
                            },
                            {
                                relationName: "GD_EMPLOYEE"
                            }
                        ]
                    }, false, "Employee", { ru: { name: "Сотрудник предприятия" } });
                    Employee.add(new gdmn_orm_1.ParentAttribute("PARENT", { ru: { name: "Организация или подразделение" } }, [Company, Department]));
                    Group = createEntity(undefined, {
                        relation: [{
                                relationName: "GD_CONTACT",
                                selector: {
                                    field: "CONTACTTYPE",
                                    value: 1
                                },
                                fields: [
                                    "PARENT",
                                    "NAME"
                                ]
                            }]
                    }, false, "Group", { ru: { name: "Группа" } });
                    Group.add(new gdmn_orm_1.ParentAttribute("PARENT", { ru: { name: "Входит в папку" } }, [Folder]));
                    Group.add(new gdmn_orm_1.SetAttribute("CONTACTLIST", { ru: { name: "Контакты" } }, false, [Company, Person], 0, [], {
                        crossRelation: "GD_CONTACTLIST"
                    }));
                    companyAccount = createEntity(undefined, gdmn_orm_1.relationName2Adapter("GD_COMPANYACCOUNT"));
                    Company.add(new gdmn_orm_1.DetailAttribute("GD_COMPANYACCOUNT", { ru: { name: "Банковские счета" } }, false, [companyAccount], [], {
                        masterLinks: [
                            {
                                detailRelation: "GD_COMPANYACCOUNT",
                                link2masterField: "COMPANYKEY"
                            }
                        ]
                    }));
                    gdtables_1.gedeminTables.forEach(function (t) { return createEntity(undefined, gdmn_orm_1.relationName2Adapter(t)); });
                    createEntity(undefined, gdmn_orm_1.relationName2Adapter("INV_CARD"));
                    TgdcDocument = createEntity(undefined, gdmn_orm_1.relationName2Adapter("GD_DOCUMENT"), true, "TgdcDocument");
                    TgdcDocumentAdapter = gdmn_orm_1.relationName2Adapter("GD_DOCUMENT");
                    documentABC = {
                        "TgdcDocumentType": TgdcDocument,
                        "TgdcUserDocumentType": createEntity(TgdcDocument, TgdcDocumentAdapter, true, "TgdcUserDocument", { ru: { name: "Пользовательские документы" } }),
                        "TgdcInvDocumentType": createEntity(TgdcDocument, TgdcDocumentAdapter, true, "TgdcInvDocument", { ru: { name: "Складские документы" } }),
                        "TgdcInvPriceListType": createEntity(TgdcDocument, TgdcDocumentAdapter, true, "TgdcInvPriceList", { ru: { name: "Прайс-листы" } })
                    };
                    documentClasses = {};
                    return [4 /*yield*/, document_1.loadDocument(connection, transaction, createDocument)];
                case 2:
                    _b.sent();
                    dbs.forEachRelation(function (r) {
                        if (r.primaryKey.fields.join() === idAttrName && /^USR\$.+$/.test(r.name)
                            && !Object.entries(r.foreignKeys).find(function (fk) { return fk[1].fields.join() === idAttrName; })) {
                            if (abstractBaseRelations[r.name]) {
                                recursInherited([r]);
                            }
                            else {
                                recursInherited([r], createEntity(undefined, gdmn_orm_1.relationName2Adapter(r.name)));
                            }
                        }
                    }, true);
                    Object.entries(erModel.entities).forEach(function (_a) {
                        var entity = _a[1];
                        return createAttributes(entity);
                    });
                    /**
                     * Looking for cross-tables and construct set attributes.
                     *
                     * 1. Cross tables are those whose PK consists of minimum 2 fields.
                     * 2. First field of cross table PK must be a FK referencing owner table.
                     * 3. Second field of cross table PK must be a FK referencing reference table.
                     * 4. Owner in this context is an Entity(s) a Set attribute belongs to.
                     * 5. Reference in this context is an Entity(s) a Set attribute contains objects of which type.
                     */
                    Object.entries(dbs.relations).forEach(function (_a) {
                        var crossName = _a[0], crossRelation = _a[1];
                        if (crossRelation.primaryKey && crossRelation.primaryKey.fields.length >= 2) {
                            var fkOwner = Object.entries(crossRelation.foreignKeys).find(function (_a) {
                                var f = _a[1];
                                return f.fields.length === 1 && f.fields[0] === crossRelation.primaryKey.fields[0];
                            });
                            if (!fkOwner)
                                return;
                            var fkReference = Object.entries(crossRelation.foreignKeys).find(function (_a) {
                                var f = _a[1];
                                return f.fields.length === 1 && f.fields[0] === crossRelation.primaryKey.fields[1];
                            });
                            if (!fkReference)
                                return;
                            var relOwner = dbs.relationByUqConstraint(fkOwner[1].constNameUq);
                            var atRelOwner = atrelations[relOwner.name];
                            if (!atRelOwner)
                                return;
                            var entitiesOwner = void 0;
                            var crossRelationAdapter = crossRelationsAdapters[crossName];
                            if (crossRelationAdapter) {
                                entitiesOwner = findEntities(crossRelationAdapter.owner, crossRelationAdapter.selector ?
                                    [crossRelationAdapter.selector] : undefined);
                            }
                            else {
                                entitiesOwner = findEntities(relOwner.name);
                            }
                            if (!entitiesOwner.length) {
                                return;
                            }
                            var relReference = dbs.relationByUqConstraint(fkReference[1].constNameUq);
                            var cond = void 0;
                            var atSetField_1 = Object.entries(atRelOwner.relationFields).find(function (rf) { return rf[1].crossTable === crossName; });
                            var atSetFieldSource = atSetField_1 ? atfields[atSetField_1[1].fieldSource] : undefined;
                            if (atSetFieldSource && atSetFieldSource.setTable === relReference.name && atSetFieldSource.setCondition) {
                                cond = gdmn_orm_1.condition2Selectors(atSetFieldSource.setCondition);
                            }
                            var referenceEntities_1 = findEntities(relReference.name, cond);
                            if (!referenceEntities_1.length) {
                                return;
                            }
                            var setField_1 = atSetField_1 ? relOwner.relationFields[atSetField_1[0]] : undefined;
                            var setFieldSource_1 = setField_1 ? dbs.fields[setField_1.fieldSource] : undefined;
                            var atCrossRelation_1 = atrelations[crossName];
                            entitiesOwner.forEach(function (e) {
                                if (!Object.entries(e.attributes).find(function (_a) {
                                    var attr = _a[1];
                                    return (attr instanceof gdmn_orm_1.SetAttribute) && !!attr.adapter && attr.adapter.crossRelation === crossName;
                                })) {
                                    var setAttr_1 = new gdmn_orm_1.SetAttribute(atSetField_1 ? atSetField_1[0] : crossName, atSetField_1 ? atSetField_1[1].lName : (atCrossRelation_1 ? atCrossRelation_1.lName : { en: { name: crossName } }), (!!setField_1 && setField_1.notNull) || (!!setFieldSource_1 && setFieldSource_1.notNull), referenceEntities_1, (setFieldSource_1 && setFieldSource_1.fieldType === gdmn_db_1.FieldType.VARCHAR) ? setFieldSource_1.fieldLength : 0, atCrossRelation_1.semCategories, {
                                        crossRelation: crossName
                                    });
                                    Object.entries(crossRelation.relationFields).forEach(function (_a) {
                                        var addName = _a[0], addField = _a[1];
                                        if (!crossRelation.primaryKey.fields.find(function (f) { return f === addName; })) {
                                            setAttr_1.add(createAttribute(crossRelation, addField, atCrossRelation_1 ? atCrossRelation_1.relationFields[addName] : undefined, addName, atCrossRelation_1.relationFields[addName].semCategories, undefined));
                                        }
                                    });
                                    e.add(setAttr_1);
                                }
                            });
                        }
                    });
                    return [2 /*return*/, erModel];
            }
        });
    });
}
exports.erExport = erExport;
//# sourceMappingURL=erexport.js.map