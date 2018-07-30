import {AConnection, ATransaction, DBStructure, FieldType, Relation, RelationField} from "gdmn-db";
import {SemCategory} from "gdmn-nlp";
import {
  adjustName,
  appendAdapter,
  Attribute,
  Attribute2FieldMap,
  BlobAttribute,
  BooleanAttribute,
  condition2Selectors,
  CrossRelations,
  DateAttribute,
  DetailAttribute,
  Entity,
  Entity2RelationMap,
  EntityAttribute,
  EntitySelector,
  EnumAttribute,
  ERModel,
  FloatAttribute,
  hasField,
  IntegerAttribute,
  isUserDefined,
  LName,
  MAX_16BIT_INT,
  MAX_32BIT_INT,
  MAX_64BIT_INT,
  MIN_16BIT_INT,
  MIN_32BIT_INT,
  MIN_64BIT_INT,
  NumericAttribute,
  ParentAttribute,
  relationName2Adapter,
  relationNames2Adapter,
  sameAdapter,
  Sequence,
  SequenceAttribute,
  SetAttribute,
  StringAttribute,
  systemFields,
  TimeAttribute,
  TimeStampAttribute
} from "gdmn-orm";
import {GLOBAL_GENERATOR} from "../updates/Update1";
import {
  check2DateRange,
  check2Enum,
  check2NumberRange,
  check2StrMin,
  check2TimeRange,
  check2TimestampRange,
  default2Boolean,
  default2Date,
  default2Float,
  default2Int,
  default2String,
  default2Time,
  default2Timestamp,
  IRange,
  isCheckForBoolean
} from "../util";
import {atRelationField, load} from "./atdata";
import {loadDocument} from "./document";
import {gdDomains} from "./gddomains";
import {gedeminTables} from "./gdtables";

const ID_ATTR_NAME = "ID";

export async function erExport(dbs: DBStructure, connection: AConnection, transaction: ATransaction, erModel: ERModel): Promise<ERModel> {

  const {atfields, atrelations} = await load(connection, transaction);

  const crossRelationsAdapters: CrossRelations = {
    "GD_CONTACTLIST": {
      owner: "GD_CONTACT",
      selector: {
        field: "CONTACTTYPE",
        value: 1
      }

    }
  };

  const abstractBaseRelations: { [name: string]: boolean } = {
    "GD_CONTACT": true
  };

  /**
   * Если имя генератора совпадает с именем объекта в БД, то адаптер можем не указывать.
   */

  const GDGUnique = erModel.addSequence(new Sequence(GLOBAL_GENERATOR));
  erModel.addSequence(new Sequence("Offset", {sequence: "GD_G_OFFSET"}));

  function findEntities(relationName: string, selectors: EntitySelector[] = []): Entity[] {
    const found = Object.entries(erModel.entities).reduce((p, e) => {
      if (e[1].adapter) {
        e[1].adapter.relation.forEach(r => {
          if (r.relationName === relationName && !r.weak) {
            if (r.selector && selectors.length) {
              if (selectors.find(s => s.field === r.selector!.field && s.value === r.selector!.value)) {
                p.push(e[1]);
              }
            } else {
              p.push(e[1]);
            }
          }
        });
      }

      return p;
    }, [] as Entity[]);

    while (found.length) {
      const descendant = found.findIndex(d => !!found.find(a => a !== d && d.hasAncestor(a)));
      if (descendant === -1) break;
      found.splice(descendant, 1);
    }

    return found;
  }

  function createEntity(parent: Entity | undefined, adapter: Entity2RelationMap,
                        abstract?: boolean, entityName?: string, lName?: LName, semCategories: SemCategory[] = [], attributes?: Attribute[]): Entity {
    if (!abstract) {
      const found = Object.entries(erModel.entities).find(
        e => !e[1].isAbstract && sameAdapter(adapter, e[1].adapter)
      );

      if (found) {
        return found[1];
      }
    }

    const relation = adapter.relation.filter(r => !r.weak).reverse()[0];

    if (!relation || !relation.relationName) {
      throw new Error("Invalid entity adapter");
    }

    const setEntityName = adjustName(entityName ? entityName : relation.relationName);
    const atRelation = atrelations[relation.relationName];
    const fake = relationName2Adapter(setEntityName);

    const entity = new Entity(
      parent,
      setEntityName,
      lName ? lName : (atRelation ? atRelation.lName : {}),
      !!abstract,
      semCategories,
      JSON.stringify(adapter) !== JSON.stringify(fake) ? adapter : undefined
    );

    if (!parent) {
      entity.add(
        new SequenceAttribute(ID_ATTR_NAME, {ru: {name: "Идентификатор"}}, GDGUnique)
      );
    }

    if (attributes) {
      attributes.forEach(attr => entity.add(attr));
    }

    return erModel.add(entity);
  }

  Object.keys(atrelations).forEach((item) => createEntity(undefined, relationName2Adapter(item)));

  /**
   * Простейший случай таблицы. Никаких ссылок.
   */

  if (dbs.findRelation((rel) => rel.name === "WG_HOLIDAY")) {
    createEntity(undefined, relationName2Adapter("WG_HOLIDAY"));
  }

  /**
   * Административно-территориальная единица.
   * Тут исключительно для иллюстрации типа данных Перечисление.
   */

  if (dbs.findRelation((rel) => rel.name === "GD_PLACE")) {
    createEntity(undefined, relationName2Adapter("GD_PLACE"), false, undefined, undefined, [SemCategory.Place],
      [
        new EnumAttribute("PLACETYPE", {ru: {name: "Тип"}}, true,
          [
            {
              value: "Область"
            },
            {
              value: "Район"
            }
          ],
          "Область"
        )
      ]);
  }

  /**
   * Папка из справочника контактов.
   * Основывается на таблице GD_CONTACT, но использует только несколько полей из нее.
   * Записи имеют признак CONTACTTYPE = 0.
   * Имеет древовидную структуру.
   */
  if (dbs.findRelation((rel) => rel.name === "GD_CONTACT")) {
    const Folder = createEntity(undefined,
      {
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
      },
      false,
      "Folder", {ru: {name: "Папка"}}
    );
    Folder.add(
      new ParentAttribute("PARENT", {ru: {name: "Входит в папку"}}, [Folder])
    );

    /**
     * Компания хранится в трех таблицах.
     * Две обязательные GD_CONTACT - GD_COMPANY. В адаптере они указываются
     * в массиве relation и соединяются в запросе оператором JOIN.
     * Первой указывается главная таблица. Остальные таблицы называются
     * дополнительными. Первичный ключ дополнительной таблицы
     * должен одновременно являться внешним ключем на главную.
     * Третья -- GD_COMPANYCODE -- необязательная. Подключается через LEFT JOIN.
     * Для атрибутов из главной таблицы можно не указывать адаптер, если их имя
     * совпадает с именем поля.
     * Флаг refresh означает, что после вставки/изменения записи ее надо перечитать.
     */
    const Company = createEntity(undefined,
      {
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
      },
      false,
      "Company", {ru: {name: "Организация"}},
      [SemCategory.Company],
      [
        new ParentAttribute("PARENT", {ru: {name: "Входит в папку"}}, [Folder]),
        new StringAttribute("NAME", {ru: {name: "Краткое наименование"}}, true,
          undefined, 60, undefined, true, undefined)
      ]
    );

    createEntity(Company,
      {
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
      },
      false,
      "OurCompany", {ru: {name: "Рабочая организация"}}
    );

    /**
     * Банк является частным случаем компании (наследуется от компании).
     * Все атрибуты компании являются и атрибутами банка и не нуждаются
     * в повторном определении, за тем исключением, если мы хотим что-то
     * поменять в параметрах атрибута.
     */
    createEntity(Company,
      {
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
      },
      false,
      "Bank", {ru: {name: "Банк"}}
    );

    /**
     * Подразделение организации может входить (через поле Parent) в
     * организацию (компания, банк) или в другое подразделение.
     */
    const Department = createEntity(undefined,
      {
        relation: [{
          relationName: "GD_CONTACT",
          selector: {
            field: "CONTACTTYPE",
            value: 4
          }
        }]
      },
      false,
      "Department", {ru: {name: "Подразделение"}}
    );
    Department.add(
      new ParentAttribute("PARENT", {ru: {name: "Входит в организацию (подразделение)"}}, [Company, Department])
    );
    Department.add(
      new StringAttribute("NAME", {ru: {name: "Наименование"}}, true,
        undefined, 60, undefined, true, undefined)
    );

    /**
     * Физическое лицо хранится в двух таблицах GD_CONTACT - GD_PEOPLE.
     */
    const Person = createEntity(undefined,
      {
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
      },
      false,
      "Person", {ru: {name: "Физическое лицо"}}
    );
    Person.add(
      new ParentAttribute("PARENT", {ru: {name: "Входит в папку"}}, [Folder])
    );
    Person.add(
      new StringAttribute("NAME", {ru: {name: "ФИО"}}, true,
        undefined, 60, undefined, true, undefined)
    );

    /**
     * Сотрудник, частный случай физического лица.
     * Добавляется таблица GD_EMPLOYEE.
     */
    const Employee = createEntity(Person,
      {
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
      },
      false,
      "Employee", {ru: {name: "Сотрудник предприятия"}}
    );
    Employee.add(
      new ParentAttribute("PARENT", {ru: {name: "Организация или подразделение"}}, [Company, Department])
    );

    /**
     * Группа контактов.
     * CONTACTLIST -- множество, которое хранится в кросс-таблице.
     */
    const Group = createEntity(undefined,
      {
        relation:
          [{
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
      },
      false,
      "Group", {ru: {name: "Группа"}}
    );
    Group.add(
      new ParentAttribute("PARENT", {ru: {name: "Входит в папку"}}, [Folder])
    );
    Group.add(
      new SetAttribute("CONTACTLIST", {ru: {name: "Контакты"}}, false, [Company, Person], 0, [],
        {
          crossRelation: "GD_CONTACTLIST"
        }
      )
    ) as SetAttribute;

    const companyAccount = createEntity(undefined, relationName2Adapter("GD_COMPANYACCOUNT"));

    Company.add(
      new DetailAttribute("GD_COMPANYACCOUNT", {ru: {name: "Банковские счета"}}, false, [companyAccount], [],
        {
          masterLinks: [
            {
              detailRelation: "GD_COMPANYACCOUNT",
              link2masterField: "COMPANYKEY"
            }
          ]
        }
      )
    );

    gedeminTables.forEach((t) => {
      if (dbs.findRelation((rel) => rel.name === t)) {
        createEntity(undefined, relationName2Adapter(t));
      }
    });
  }

  if (dbs.findRelation((rel) => rel.name === "INV_CARD")) {
    createEntity(undefined, relationName2Adapter("INV_CARD"));
  }

  const TgdcDocument = createEntity(undefined, relationName2Adapter("GD_DOCUMENT"), true, "TgdcDocument");
  const TgdcDocumentAdapter = relationName2Adapter("GD_DOCUMENT");
  const documentABC: { [name: string]: Entity } = {
    "TgdcDocumentType": TgdcDocument,
    "TgdcUserDocumentType": createEntity(TgdcDocument, TgdcDocumentAdapter, true, "TgdcUserDocument", {ru: {name: "Пользовательские документы"}}),
    "TgdcInvDocumentType": createEntity(TgdcDocument, TgdcDocumentAdapter, true, "TgdcInvDocument", {ru: {name: "Складские документы"}}),
    "TgdcInvPriceListType": createEntity(TgdcDocument, TgdcDocumentAdapter, true, "TgdcInvPriceList", {ru: {name: "Прайс-листы"}})
  };

  const documentClasses: { [ruid: string]: { header: Entity, line?: Entity } } = {};

  function createDocument(id: number, ruid: string, parent_ruid: string, name: string,
                          className: string, hr: string, lr: string) {
    const setHR = hr ? hr
      : id === 800300 ? "BN_BANKSTATEMENT"
        : id === 800350 ? "BN_BANKCATALOGUE"
          : "";

    const setLR = lr ? lr
      : id === 800300 ? "BN_BANKSTATEMENTLINE"
        : id === 800350 ? "BN_BANKCATALOGUELINE"
          : "";

    const parent = documentClasses[parent_ruid] && documentClasses[parent_ruid].header ? documentClasses[parent_ruid].header
      : documentABC[className] ? documentABC[className]
        : TgdcDocument;

    if (!parent) {
      throw new Error(`Unknown doc type ${parent_ruid} of ${className}`);
    }

    const headerAdapter = appendAdapter(parent.adapter, setHR);
    headerAdapter.relation[0].selector = {field: "DOCUMENTTYPEKEY", value: id};
    const header = createEntity(parent, headerAdapter, false, `DOC_${ruid}_${setHR}`, {ru: {name}});

    documentClasses[ruid] = {header};

    if (setLR) {
      const lineParent = documentClasses[parent_ruid] && documentClasses[parent_ruid].line ? documentClasses[parent_ruid].line
        : documentABC[className] ? documentABC[className]
          : TgdcDocument;

      if (!lineParent) {
        throw new Error(`Unknown doc type ${parent_ruid} of ${className}`);
      }

      const lineAdapter = appendAdapter(lineParent.adapter, setLR);
      lineAdapter.relation[0].selector = {field: "DOCUMENTTYPEKEY", value: id};
      const line = createEntity(lineParent, lineAdapter,
        false, `LINE_${ruid}_${setLR}`, {ru: {name: `Позиция: ${name}`}});
      line.add(
        new ParentAttribute("PARENT", {ru: {name: "Шапка документа"}}, [header])
      );
      documentClasses[ruid] = {...documentClasses[ruid], line};
      const masterLinks = [
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
      header.add(
        new DetailAttribute(line.name, line.lName, false, [line], [], {masterLinks})
      );
    }
  }

  await loadDocument(connection, transaction, createDocument);

  function recursInherited(parentRelation: Relation[], parentEntity?: Entity) {
    dbs.forEachRelation(inherited => {
      if (Object.entries(inherited.foreignKeys).find(
        ([, f]) => f.fields.join() === inherited.primaryKey!.fields.join()
          && dbs.relationByUqConstraint(f.constNameUq) === parentRelation[parentRelation.length - 1])) {
        const newParent = [...parentRelation, inherited];
        const parentAdapter = parentEntity ? parentEntity.adapter
          : relationNames2Adapter(parentRelation.map(p => p.name));
        recursInherited(newParent, createEntity(parentEntity,
          appendAdapter(parentAdapter, inherited.name), false,
          inherited.name, atrelations[inherited.name] ? atrelations[inherited.name].lName : {}));
      }
    }, true);
  }

  dbs.forEachRelation(r => {
    if (r.primaryKey!.fields.join() === ID_ATTR_NAME && /^USR\$.+$/.test(r.name)
      && !Object.entries(r.foreignKeys).find(fk => fk[1].fields.join() === ID_ATTR_NAME)) {
      if (abstractBaseRelations[r.name]) {
        recursInherited([r]);
      } else {
        recursInherited([r], createEntity(undefined, relationName2Adapter(r.name)));
      }
    }
  }, true);

  function createAttribute(r: Relation,
                           rf: RelationField,
                           atRelationField: atRelationField | undefined,
                           attrName: string,
                           semCategories: SemCategory[],
                           adapter: Attribute2FieldMap | undefined) {
    const attributeName = adjustName(attrName);
    const atField = atfields[rf.fieldSource];
    const fieldSource = dbs.fields[rf.fieldSource];
    const required: boolean = rf.notNull || fieldSource.notNull;
    const defaultValue: string | null = rf.defaultSource || fieldSource.defaultSource;
    const lName = atRelationField ? atRelationField.lName : (atField ? atField.lName : {});

    const createDomainFunc = gdDomains[rf.fieldSource];

    if (createDomainFunc) {
      return createDomainFunc(attributeName, lName, adapter);
    }

    // numeric and decimal
    if (fieldSource.fieldSubType === 1 || fieldSource.fieldSubType === 2) {
      const factor = Math.pow(10, Math.abs(fieldSource.fieldScale));
      let range: IRange<number> | undefined;
      switch (fieldSource.fieldType) {
        case FieldType.SMALL_INTEGER:
          range = check2NumberRange(fieldSource.validationSource, {
            min: MIN_16BIT_INT * factor,
            max: MAX_16BIT_INT * factor
          });
          break;
        case FieldType.INTEGER:
          range = check2NumberRange(fieldSource.validationSource, {
            min: MIN_32BIT_INT * factor,
            max: MAX_32BIT_INT * factor
          });
          break;
        case FieldType.BIG_INTEGER:
          range = check2NumberRange(fieldSource.validationSource, {
            min: MIN_64BIT_INT * factor,
            max: MAX_64BIT_INT * factor
          });
          break;
      }
      if (range) {
        return new NumericAttribute(attributeName, lName, required,
          fieldSource.fieldPrecision,
          Math.abs(fieldSource.fieldScale),
          range.minValue, range.maxValue,
          default2Float(defaultValue),
          semCategories,
          adapter);
      }
    }

    switch (fieldSource.fieldType) {
      case FieldType.INTEGER: {
        const fk = Object.entries(r.foreignKeys).find(
          ([, f]) => !!f.fields.find(fld => fld === attributeName)
        );

        if (fk && fk[1].fields.length === 1) {
          const refRelationName = dbs.relationByUqConstraint(fk[1].constNameUq).name;
          const cond = atField && atField.refCondition ? condition2Selectors(atField.refCondition) : undefined;
          const refEntities = findEntities(refRelationName, cond);

          if (!refEntities.length) {
            console.warn(`${r.name}.${rf.name}: no entities for table ${refRelationName}${cond ? ", condition: " + JSON.stringify(cond) : ""}`);
          }

          return new EntityAttribute(attributeName, lName, required, refEntities, semCategories, adapter);
        } else {
          const iRange = check2NumberRange(fieldSource.validationSource, {min: MIN_32BIT_INT, max: MAX_32BIT_INT});
          return new IntegerAttribute(attributeName, lName, required, iRange.minValue, iRange.maxValue,
            default2Int(defaultValue), semCategories, adapter);
        }
      }

      case FieldType.CHAR:
      case FieldType.VARCHAR: {
        if (fieldSource.fieldLength === 1) {
          const values = check2Enum(fieldSource.validationSource);
          if (values.length) {
            const dif = atField.numeration ? atField.numeration.split("#13#10") : [];
            const mapValues = dif.reduce((map, item) => {
              const [key, value] = item.split("=");
              map[key] = value;
              return map;
            }, {} as { [field: string]: string });

            return new EnumAttribute(attributeName, lName, required, values.map((value) => ({
              value,
              lName: mapValues[value] ? {ru: {name: mapValues[value]}} : undefined
            })), default2String(defaultValue), semCategories, adapter);
          }
        }

        const minLength = check2StrMin(fieldSource.validationSource);
        return new StringAttribute(attributeName, lName, required, minLength, fieldSource.fieldLength,
          default2String(defaultValue), true, undefined, semCategories, adapter);
      }

      case FieldType.TIMESTAMP:
        const tsRange = check2TimestampRange(fieldSource.validationSource);
        return new TimeStampAttribute(attributeName, lName, required, tsRange.minValue, tsRange.maxValue,
          default2Timestamp(defaultValue), semCategories, adapter);

      case FieldType.DATE:
        const dRange = check2DateRange(fieldSource.validationSource);
        return new DateAttribute(attributeName, lName, required, dRange.minValue, dRange.maxValue,
          default2Date(defaultValue), semCategories, adapter);

      case FieldType.TIME:
        const tRange = check2TimeRange(fieldSource.validationSource);
        return new TimeAttribute(attributeName, lName, required, tRange.minValue, tRange.maxValue,
          default2Time(defaultValue), semCategories, adapter);

      case FieldType.FLOAT:
      case FieldType.DOUBLE:
        const fRange = check2NumberRange(fieldSource.validationSource);
        return new FloatAttribute(attributeName, lName, required, fRange.minValue, fRange.maxValue,
          default2Float(defaultValue), semCategories, adapter);

      case FieldType.SMALL_INTEGER:
        if (isCheckForBoolean(fieldSource.validationSource)) {
          return new BooleanAttribute(attributeName, lName, required,
            default2Boolean(defaultValue), semCategories, adapter);
        }
        const siRange = check2NumberRange(fieldSource.validationSource, {min: MIN_16BIT_INT, max: MAX_16BIT_INT});
        return new IntegerAttribute(attributeName, lName, required, siRange.minValue, siRange.maxValue,
          default2Int(defaultValue), semCategories, adapter);

      case FieldType.BIG_INTEGER:
        const biRange = check2NumberRange(fieldSource.validationSource, {min: MIN_64BIT_INT, max: MAX_64BIT_INT});
        return new IntegerAttribute(attributeName, lName, required, biRange.minValue, biRange.maxValue,
          default2Int(defaultValue), semCategories, adapter);

      case FieldType.BLOB:
        if (fieldSource.fieldSubType === 1) {
          return new StringAttribute(attributeName, lName, required, 0, undefined,
            default2String(defaultValue), false, undefined, semCategories, adapter);
        } else {
          return new BlobAttribute(attributeName, lName, required, semCategories, adapter);
        }

      default:
        throw new Error(`Unknown data type ${fieldSource}=${fieldSource.fieldType} for field ${r.name}.${attributeName}`);
    }
  }

  function createAttributes(entity: Entity) {
    const relations = entity.adapter.relation.map(rn => dbs.relations[rn.relationName]);

    relations.forEach(r => {
      if (!r || !r.primaryKey) return;

      const atRelation = atrelations[r.name];

      Object.entries(r.relationFields).forEach(([fn, rf]) => {
        if (r.primaryKey!.fields.find(f => f === fn)) return;

        if (fn === "LB" || fn === "RB") return;

        if (entity.hasAttribute(fn)) return;

        if (!hasField(entity.adapter, r.name, fn)
          && !systemFields.find(sf => sf === fn)
          && !isUserDefined(fn)) {
          return;
        }

        if (entity.adapter.relation[0].selector && entity.adapter.relation[0].selector!.field === fn) {
          return;
        }

        const atRelationField = atRelation ? atRelation.relationFields[fn] : undefined;

        if (atRelationField && atRelationField.crossTable) return;

        let attrName = entity.hasAttribute(fn) ? `${r.name}.${fn}` : fn;
        let adapter = relations.length > 1 ? {relation: r.name, field: fn} : undefined;

        // for custom field adapters
        if (atRelationField && atRelationField.attrName !== undefined) {
          attrName = atRelationField.attrName;
          adapter = {relation: r.name, field: fn};
        }
        const attr = createAttribute(
          r, rf, atRelationField,
          attrName,
          atRelationField ? atRelationField.semCategories : [],
          adapter
        );

        if (attr) {
          entity.add(attr);
        }
      });

      Object.entries(r.unique).forEach(uq => {
        entity.addUnique(uq[1].fields.map(f => entity.attribute(f)));
      });
    });
  }

  Object.entries(erModel.entities).forEach(([, entity]) => createAttributes(entity));

  /**
   * Looking for cross-tables and construct set attributes.
   *
   * 1. Cross tables are those whose PK consists of minimum 2 fields.
   * 2. First field of cross table PK must be a FK referencing owner table.
   * 3. Second field of cross table PK must be a FK referencing reference table.
   * 4. Owner in this context is an Entity(s) a Set attribute belongs to.
   * 5. Reference in this context is an Entity(s) a Set attribute contains objects of which type.
   */
  Object.entries(dbs.relations).forEach(([crossName, crossRelation]) => {
    if (crossRelation.primaryKey && crossRelation.primaryKey.fields.length >= 2) {
      const fkOwner = Object.entries(crossRelation.foreignKeys).find(
        ([, f]) => f.fields.length === 1 && f.fields[0] === crossRelation.primaryKey!.fields[0]
      );

      if (!fkOwner) return;

      const fkReference = Object.entries(crossRelation.foreignKeys).find(
        ([, f]) => f.fields.length === 1 && f.fields[0] === crossRelation.primaryKey!.fields[1]
      );

      if (!fkReference) return;

      const relOwner = dbs.relationByUqConstraint(fkOwner[1].constNameUq);
      const atRelOwner = atrelations[relOwner.name];

      if (!atRelOwner) return;

      let entitiesOwner: Entity[];

      const crossRelationAdapter = crossRelationsAdapters[crossName];

      if (crossRelationAdapter) {
        entitiesOwner = findEntities(crossRelationAdapter.owner, crossRelationAdapter.selector ?
          [crossRelationAdapter.selector] : undefined);
      } else {
        entitiesOwner = findEntities(relOwner.name);
      }

      if (!entitiesOwner.length) {
        return;
      }

      const relReference = dbs.relationByUqConstraint(fkReference[1].constNameUq);

      let cond: EntitySelector[] | undefined;
      const atSetField = Object.entries(atRelOwner.relationFields).find(
        rf => rf[1].crossTable === crossName
      );
      const atSetFieldSource = atSetField ? atfields[atSetField[1].fieldSource] : undefined;
      if (atSetFieldSource && atSetFieldSource.setTable === relReference.name && atSetFieldSource.setCondition) {
        cond = condition2Selectors(atSetFieldSource.setCondition);
      }

      const referenceEntities = findEntities(relReference.name, cond);

      if (!referenceEntities.length) {
        return;
      }

      const setField = atSetField ? relOwner.relationFields[atSetField[0]] : undefined;
      const setFieldSource = setField ? dbs.fields[setField.fieldSource] : undefined;
      const atCrossRelation = atrelations[crossName];

      entitiesOwner.forEach(e => {
        if (!Object.entries(e.attributes).find(([, attr]) =>
          (attr instanceof SetAttribute) && !!attr.adapter && attr.adapter.crossRelation === crossName)) {
          const setAttr = new SetAttribute(
            atSetField ? atSetField[0] : crossName,
            atSetField ? atSetField[1].lName : (atCrossRelation ? atCrossRelation.lName : {en: {name: crossName}}),
            (!!setField && setField.notNull) || (!!setFieldSource && setFieldSource.notNull),
            referenceEntities,
            (setFieldSource && setFieldSource.fieldType === FieldType.VARCHAR) ? setFieldSource.fieldLength : 0,
            atCrossRelation.semCategories,
            {
              crossRelation: crossName
            }
          );

          Object.entries(crossRelation.relationFields).forEach(([addName, addField]) => {
            if (!crossRelation.primaryKey!.fields.find(f => f === addName)) {
              setAttr.add(
                createAttribute(
                  crossRelation,
                  addField,
                  atCrossRelation ? atCrossRelation.relationFields[addName] : undefined,
                  addName,
                  atCrossRelation.relationFields[addName].semCategories,
                  undefined
                )
              );
            }
          });

          e.add(setAttr);
        }
      });
    }
  });

  return erModel;
}
