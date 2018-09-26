import { AConnection } from "gdmn-db";
import { ERBridge } from "../src/ERBridge";
import { ERModel, MAX_16BIT_INT, MIN_16BIT_INT, Entity, IntegerAttribute, StringAttribute, TimeStampAttribute, EntityAttribute, SetAttribute, ScalarAttribute, DetailAttribute } from "gdmn-orm";
import { IInsert, Scalar, Crud, IUpdateOrInsert, IScalarAttrValue, IEntityAttrValue, ISetAttrValue, IDetailAttrValue, } from "../src/crud/Crud";
import { Constants } from "../src/ddl/Constants";

export function testInsert(
  connection: AConnection,
  initERModel): void {

  describe("ERBridge INSERT", async () => {

    it("Insert in batch mode", async () => {
      const erModel = new ERModel();
      await initERModel(erModel, async (transaction) => {

        const appEntity = await erModel.create(transaction, new Entity({
          name: "APPLICATION", lName: { ru: { name: "Приложение" } }
        }));

        await appEntity.create(transaction, new StringAttribute({
          name: "UID", lName: { ru: { name: "Идентификатор приложения" } }, required: true, minLength: 1, maxLength: 36
        }));

        await appEntity.addAttrUnique(transaction, [appEntity.attribute("UID")]);

        const backupEntity = await erModel.create(transaction, new Entity({
          name: "APPLICATION_BACKUPS", lName: { ru: { name: "Бэкап" } }
        }));
        await backupEntity.create(transaction, new StringAttribute({
          name: "UID", lName: { ru: { name: "Идентификатор бэкапа" } }, required: true, minLength: 1, maxLength: 36
        }));
        await backupEntity.addAttrUnique(transaction, [backupEntity.attribute("UID")]);
        await backupEntity.create(transaction,
          new EntityAttribute({
            name: "APP", lName: { ru: { name: " " } }, required: true, entities: [appEntity]
          })
        );
        await backupEntity.create(transaction, new StringAttribute({
          name: "ALIAS", lName: { ru: { name: "Название бэкапа" } }, required: true, minLength: 1, maxLength: 120
        }));

        const placeEntity = await erModel.create(transaction, new Entity({ name: "PLACE", lName: { ru: { name: "Место" } } }));
        await placeEntity.create(transaction, new StringAttribute({
          name: "ADDRESS", lName: { ru: { name: "Адрес" } }, required: true, minLength: 1, maxLength: 100
        }));

        const userEntity = await erModel.create(transaction, new Entity({
          name: "APP_USER", lName: { ru: { name: "Пользователь" } }
        }));
        const userLogin = await userEntity.create(transaction, new StringAttribute({
          name: "LOGIN", lName: { ru: { name: "Логин" } }, required: true, minLength: 1,
          maxLength: 32
        }));
        const appSet = new SetAttribute({
          name: "APPLICATIONS", lName: { ru: { name: "Приложения" } }, entities: [appEntity],
          adapter: { crossRelation: "APP_USER_APPLICATIONS" }
        });
        appSet.add(new StringAttribute({
          name: "ALIAS", lName: { ru: { name: "Название приложения" } }, required: true, minLength: 1, maxLength: 120
        }));
        await userEntity.create(transaction, appSet);

        await userEntity.create(transaction, new EntityAttribute({
          name: "PLACE", lName: {}, entities: [placeEntity]
        }));
        await userEntity.create(transaction, new DetailAttribute({
          name: "DETAIL_PLACE", lName: { ru: { name: "Детальное место" } },
          required: false, entities: [placeEntity],
          adapter: {
            masterLinks: [{
              detailRelation: placeEntity.name,
              link2masterField: Constants.DEFAULT_MASTER_KEY_NAME
            }]
          }
        }));
      });


      const appEntity = erModel.entity("APPLICATION");

      const appUIDValue1: IScalarAttrValue = {
        attribute: appEntity.attribute("UID"),
        value: "uid1"
      };
      const app1: IInsert = {
        entity: appEntity,
        attrsValues: [appUIDValue1]
      };

      const appUIDValue2: IScalarAttrValue = {
        attribute: appEntity.attribute("UID"),
        value: "uid2"
      };
      const app2: IInsert = {
        entity: appEntity,
        attrsValues: [appUIDValue2]
      };

      const appUIDValue3: IScalarAttrValue = {
        attribute: appEntity.attribute("UID"),
        value: "uid3"
      };
      const app3: IInsert = {
        entity: appEntity,
        attrsValues: [appUIDValue3]
      };

      const appUIDValue4: IScalarAttrValue = {
        attribute: appEntity.attribute("UID"),
        value: "uid4"
      };
      const app4: IInsert = {
        entity: appEntity,
        attrsValues: [appUIDValue4]
      };

      const appUIDValue5: IScalarAttrValue = {
        attribute: appEntity.attribute("UID"),
        value: "uid5"
      };
      const app5: IInsert = {
        entity: appEntity,
        attrsValues: [appUIDValue5]
      };

      const apps = [app1, app2, app3, app4, app5];
      const appIDs = await Crud.executeInsert(connection, apps);


      const backupEntity = erModel.entity("APPLICATION_BACKUPS");

      const appIDValue1: IEntityAttrValue = {
        attribute: backupEntity.attribute("APP") as EntityAttribute,
        values: [appIDs[0]]
      };
      const backupUIDValue1: IScalarAttrValue = {
        attribute: backupEntity.attribute("UID"),
        value: "uid1"
      };
      const backupAliasValue1: IScalarAttrValue = {
        attribute: backupEntity.attribute("ALIAS"),
        value: "alias1"
      };
      const insertBackup1: IInsert = {
        entity: backupEntity,
        attrsValues: [appIDValue1, backupUIDValue1, backupAliasValue1]
      };
      const appIDValue2: IEntityAttrValue = {
        attribute: backupEntity.attribute("APP") as EntityAttribute,
        values: [appIDs[1]]
      };
      const backupUIDValue2: IScalarAttrValue = {
        attribute: backupEntity.attribute("UID"),
        value: "uid2"
      };
      const backupAliasValue2: IScalarAttrValue = {
        attribute: backupEntity.attribute("ALIAS"),
        value: "alias2"
      };
      const insertBackup2: IInsert = {
        entity: backupEntity,
        attrsValues: [appIDValue2, backupUIDValue2, backupAliasValue2]
      };
      const appIDValue3: IEntityAttrValue = {
        attribute: backupEntity.attribute("APP") as EntityAttribute,
        values: [appIDs[2]]
      };
      const backupUIDValue3: IScalarAttrValue = {
        attribute: backupEntity.attribute("UID"),
        value: "uid3"
      };
      const backupAliasValue3: IScalarAttrValue = {
        attribute: backupEntity.attribute("ALIAS"),
        value: "alias3"
      };
      const insertBackup3: IInsert = {
        entity: backupEntity,
        attrsValues: [appIDValue3, backupUIDValue3, backupAliasValue3]
      };

      const backups = [insertBackup1, insertBackup2, insertBackup3];
      const backupsIDs = await Crud.executeInsert(connection, backups);


      const placeEntity = erModel.entity("PLACE");

      const placeAddressValue1: IScalarAttrValue = {
        attribute: placeEntity.attribute("ADDRESS"),
        value: "address1"
      };
      const placeInsert1: IInsert = {
        entity: placeEntity,
        attrsValues: [placeAddressValue1]
      };

      const placeAddressValue2: IScalarAttrValue = {
        attribute: placeEntity.attribute("ADDRESS"),
        value: "address2"
      };
      const placeInsert2: IInsert = {
        entity: placeEntity,
        attrsValues: [placeAddressValue2]
      };

      const placeAddressValue3: IScalarAttrValue = {
        attribute: placeEntity.attribute("ADDRESS"),
        value: "address3"
      };
      const placeInsert3: IInsert = {
        entity: placeEntity,
        attrsValues: [placeAddressValue3]
      };

      const placeAddressValue4: IScalarAttrValue = {
        attribute: placeEntity.attribute("ADDRESS"),
        value: "address4"
      };
      const placeInsert4: IInsert = {
        entity: placeEntity,
        attrsValues: [placeAddressValue4]
      };

      const placeAddressValue5: IScalarAttrValue = {
        attribute: placeEntity.attribute("ADDRESS"),
        value: "address5"
      };
      const placeInsert5: IInsert = {
        entity: placeEntity,
        attrsValues: [placeAddressValue5]
      };

      const places = [placeInsert1, placeInsert2, placeInsert3, placeInsert4, placeInsert5];
      const placesIDs = await Crud.executeInsert(connection, places);


      const userEntity = erModel.entity("APP_USER");
      const appSetAttribute: SetAttribute = userEntity.attribute("APPLICATIONS") as SetAttribute;


      const appAliasValue1: IScalarAttrValue = {
        attribute: appSetAttribute.attribute("ALIAS"),
        value: "alias1"
      };
      const appAliasValue2: IScalarAttrValue = {
        attribute: appSetAttribute.attribute("ALIAS"),
        value: "alias2"
      };
      const appAliasValue3: IScalarAttrValue = {
        attribute: appSetAttribute.attribute("ALIAS"),
        value: "alias3"
      };
      const userAppSetAttrValue1: ISetAttrValue = {
        attribute: appSetAttribute,
        crossValues: [[appAliasValue1], [appAliasValue2], [appAliasValue3]],
        refIDs: [appIDs[0], appIDs[1], appIDs[2]]
      };

      const userLoginAttrValue1: IScalarAttrValue = {
        attribute: userEntity.attribute("LOGIN"),
        value: "login1"
      };

      const userPlaceDetailAttrValue1: IDetailAttrValue = {
        attribute: userEntity.attribute("DETAIL_PLACE") as DetailAttribute,
        pks: [[placesIDs[0]], [placesIDs[1]]]
      };

      const userInsert1: IInsert = {
        entity: userEntity,
        attrsValues: [userLoginAttrValue1, userAppSetAttrValue1, userPlaceDetailAttrValue1]
      };


      const appAliasValue4: IScalarAttrValue = {
        attribute: appSetAttribute.attribute("ALIAS"),
        value: "alias4"
      };
      const appAliasValue5: IScalarAttrValue = {
        attribute: appSetAttribute.attribute("ALIAS"),
        value: "alias5"
      };
      const userAppSetAttrValue2 = {
        attribute: appSetAttribute,
        crossValues: [[appAliasValue4], [appAliasValue5]],
        refIDs: [appIDs[3], appIDs[4]]
      };

      const userLoginAttrValue2: IScalarAttrValue = {
        attribute: userEntity.attribute("LOGIN"),
        value: "login2"
      };

      const userPlaceDetailAttrValue2: IDetailAttrValue = {
        attribute: userEntity.attribute("DETAIL_PLACE") as DetailAttribute,
        pks: [[placesIDs[2]], [placesIDs[3]], [placesIDs[4]]]
      };

      const userInsert2: IInsert = {
        entity: userEntity,
        attrsValues: [userLoginAttrValue2, userAppSetAttrValue2, userPlaceDetailAttrValue2]
      };

      const users = [userInsert1, userInsert2];
      const usersIDs = await Crud.executeInsert(connection, users);

      await AConnection.executeTransaction({
        connection,
        callback: async (transaction) => {

          const appsSQL = `SELECT * FROM ${appEntity.name} WHERE
          ID = :appID1 OR ID = :appID2 OR ID = :appID3 OR ID = :appID4 OR ID = :appID5`;

          const appsIDParams = {
            appID1: appIDs[0],
            appID2: appIDs[1],
            appID3: appIDs[2],
            appID4: appIDs[3],
            appID5: appIDs[4]
          };

          const appsResult = await connection.executeQuery(
            transaction,
            appsSQL,
            appsIDParams
          );

          await appsResult.next();
          const insertedAppUID1 = appsResult.getString("UID");
          const [expectedAppUID1] = apps[0].attrsValues as IScalarAttrValue[];
          expect(insertedAppUID1).toEqual(expectedAppUID1.value);

          await appsResult.next();
          const insertedAppUID2 = appsResult.getString("UID");
          const [expectedAppUID2] = apps[1].attrsValues as IScalarAttrValue[];
          expect(insertedAppUID2).toEqual(expectedAppUID2.value);

          await appsResult.next();
          const insertedAppUID3 = appsResult.getString("UID");
          const [expectedAppUID3] = apps[2].attrsValues as IScalarAttrValue[];
          expect(insertedAppUID3).toEqual(expectedAppUID3.value);

          await appsResult.next();
          const insertedAppUID4 = appsResult.getString("UID");
          const [expectedAppUID4] = apps[3].attrsValues as IScalarAttrValue[];
          expect(insertedAppUID4).toEqual(expectedAppUID4.value);

          await appsResult.next();
          const insertedAppUID5 = appsResult.getString("UID");
          const [expectedAppUID5] = apps[4].attrsValues as IScalarAttrValue[];
          expect(insertedAppUID5).toEqual(expectedAppUID5.value);

          const backupsSQL = `SELECT * FROM ${backupEntity.name} WHERE
          ID = :backupID1 OR ID = :backupID2 OR ID = :backupID3`;
          const backupsIDParams = {
            backupID1: backupsIDs[0],
            backupID2: backupsIDs[1],
            backupID3: backupsIDs[2]
          };

          const backupsResult = await connection.executeQuery(
            transaction,
            backupsSQL,
            backupsIDParams
          );

          for (const i in backupsIDs) {
            await backupsResult.next();
            const insertedAppID = backupsResult.getNumber("APP");
            const insertedUID = backupsResult.getString("UID");
            const insertedAlias = backupsResult.getString("ALIAS");
            const expectedAppID = backups[i].attrsValues[0] as IEntityAttrValue;

            const [, expectedBackupUID, expectedBackupAlias] = backups[i].attrsValues as IScalarAttrValue[];

            expect(insertedAppID).toEqual(expectedAppID.values[0]);
            expect(insertedUID).toEqual(expectedBackupUID.value);
            expect(insertedAlias).toEqual(expectedBackupAlias.value);
          }

          const placesSQL = `SELECT * FROM ${placeEntity.name} WHERE
          ID = :placeID1 OR ID = :placeID2 OR ID = :placeID3 OR ID = :placeID4 OR ID = :placeID5`;
          const placesIDParams = {
            placeID1: placesIDs[0],
            placeID2: placesIDs[1],
            placeID3: placesIDs[2],
            placeID4: placesIDs[3],
            placeID5: placesIDs[4]
          };

          const placesResult = await connection.executeQuery(
            transaction,
            placesSQL,
            placesIDParams
          );

          for (const i in placesIDs) {
            await placesResult.next();
            const insertedAddress = placesResult.getString("ADDRESS");
            const masterkey = placesResult.getNumber(Constants.DEFAULT_MASTER_KEY_NAME);
            const expectedAddress = places[i].attrsValues[0] as IScalarAttrValue;
            expect(insertedAddress).toEqual(expectedAddress.value);
            if (Number(i) < 2) {
              expect(masterkey).toEqual(usersIDs[0]);
            }
            if (Number(i) >= 2) {
              expect(masterkey).toEqual(usersIDs[1]);
            }
          }

          const userAppSetSQL = `SELECT * FROM ${appSetAttribute.adapter.crossRelation}`;
          const userAppSetResult = await connection.executeQuery(transaction, userAppSetSQL);

          const [expectedAppID1, expectedAppID2, expectedAppID3] = userAppSetAttrValue1.refIDs;
          const [[expectedAlias1], [expectedAlias2], [expectedAlias3]] = userAppSetAttrValue1.crossValues;

          await userAppSetResult.next();
          const userID1 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
          const appID1 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
          const alias1 = userAppSetResult.getString("ALIAS");
          expect(userID1).toBe(usersIDs[0]);
          expect(appID1).toBe(expectedAppID1);
          expect(alias1).toBe(expectedAlias1.value);

          await userAppSetResult.next();
          const userID2 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
          const appID2 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
          const alias2 = userAppSetResult.getString("ALIAS");
          expect(userID2).toBe(usersIDs[0]);
          expect(appID2).toBe(expectedAppID2);
          expect(alias2).toBe(expectedAlias2.value);

          await userAppSetResult.next();
          const userID3 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
          const appID3 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
          const alias3 = userAppSetResult.getString("ALIAS");
          expect(userID3).toBe(usersIDs[0]);
          expect(appID3).toBe(expectedAppID3);
          expect(alias3).toBe(expectedAlias3.value);

          const [expectedAppID4, expectedAppID5] = userAppSetAttrValue2.refIDs;
          const [[expectedAlias4], [expectedAlias5]] = userAppSetAttrValue2.crossValues;

          await userAppSetResult.next();
          const userID4 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
          const appID4 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
          const alias4 = userAppSetResult.getString("ALIAS");
          expect(userID4).toBe(usersIDs[1]);
          expect(appID4).toBe(expectedAppID4);
          expect(alias4).toBe(expectedAlias4.value);

          await userAppSetResult.next();
          const userID5 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_OWN_NAME);
          const appID5 = userAppSetResult.getNumber(Constants.DEFAULT_CROSS_PK_REF_NAME);
          const alias5 = userAppSetResult.getString("ALIAS");
          expect(userID5).toBe(usersIDs[1]);
          expect(appID5).toBe(expectedAppID5);
          expect(alias5).toBe(expectedAlias5.value);

          const usersSQL = `SELECT * FROM ${userEntity.name}`;
          const usersResult = await connection.executeQuery(transaction, usersSQL);

          await usersResult.next();
          const loginAttrValue1 = userInsert1.attrsValues[0] as IScalarAttrValue;
          const expectedLogin1 = loginAttrValue1.value;
          const login1 = usersResult.getString("LOGIN");
          expect(login1).toBe(expectedLogin1);

          await usersResult.next();
          const loginAttrValue2 = userInsert2.attrsValues[0] as IScalarAttrValue;
          const expectedLogin2 = loginAttrValue2.value;
          const login2 = usersResult.getString("LOGIN");
          expect(login2).toBe(expectedLogin2);
        }
      });

    });

  });
}
