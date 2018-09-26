import { AConnection } from "gdmn-db";
import { ERBridge } from "../src/ERBridge";
import { ERModel, MAX_16BIT_INT, MIN_16BIT_INT, Entity, IntegerAttribute, StringAttribute, TimeStampAttribute, EntityAttribute, SetAttribute, ScalarAttribute, DetailAttribute } from "gdmn-orm";
import { IInsert, Scalar, Crud, IUpdateOrInsert, IDelete, IScalarAttrValue, IEntityAttrValue, ISetAttrValue, IDetailAttrValue, } from "../src/crud/Crud";
import { Constants } from "../src/ddl/Constants";

export function testDelete(
  connection: AConnection,
  initERModel): void {

  describe("ERBridge Delete", async () => {

    it("Delete", async () => {
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

      const apps = [app1, app2, app3];
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

      const backups = [insertBackup1, insertBackup2];
      const backupsIDs = await Crud.executeInsert(connection, backups);


      const placeEntity = erModel.entity("PLACE");

      const placeAddressValue1: IScalarAttrValue = {
        attribute: placeEntity.attribute("ADDRESS"),
        value: "address1"
      };
      const placeInsert1: IUpdateOrInsert = {
        entity: placeEntity,
        attrsValues: [placeAddressValue1]
      };

      const placeAddressValue2: IScalarAttrValue = {
        attribute: placeEntity.attribute("ADDRESS"),
        value: "address2"
      };
      const placeInsert2: IUpdateOrInsert = {
        entity: placeEntity,
        attrsValues: [placeAddressValue2]
      };

      const places = [placeInsert1, placeInsert2];
      const placesIDs = await Crud.executeUpdateOrInsert(connection, places);

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
      const userAppSetAttrValue1: ISetAttrValue = {
        attribute: appSetAttribute,
        crossValues: [[appAliasValue1], [appAliasValue2]],
        refIDs: [appIDs[0], appIDs[1]]
      };
      const userLoginAttrValue1: IScalarAttrValue = {
        attribute: userEntity.attribute("LOGIN"),
        value: "login1"
      };

      const userPlaceDetailAttrValue1: IDetailAttrValue = {
        attribute: userEntity.attribute("DETAIL_PLACE") as DetailAttribute,
        pks: [[placesIDs[0]], [placesIDs[1]]]
      };

      const user1: IUpdateOrInsert = {
        entity: userEntity,
        attrsValues: [userLoginAttrValue1, userAppSetAttrValue1, userPlaceDetailAttrValue1]
      };

      const usersIDs = await Crud.executeInsert(connection, [user1]);


      const userDelete: IDelete = {
        pk: [usersIDs[0]],
        entity: userEntity
      };

      await Crud.executeDelete(connection, [userDelete]);

      const backupDelete1: IDelete = {
        pk: [backupsIDs[0]],
        entity: backupEntity
      };
      const backupDelete2: IDelete = {
        pk: [backupsIDs[1]],
        entity: backupEntity
      };
      const backupsDelete = [backupDelete1, backupDelete2];
      await Crud.executeDelete(connection, backupsDelete);

      await AConnection.executeTransaction({
        connection,
        callback: async (transaction) => {

          const backupsSQL = `SELECT * FROM ${backupEntity.name} WHERE
          ID = :backupID1 OR ID = :backupID2`;

          const backupsIDParams = {
            backupID1: backupsIDs[0],
            backupID2: backupsIDs[1],
          };

          const backupsResult = await connection.executeQuery(
            transaction,
            backupsSQL,
            backupsIDParams
          );
          expect(await backupsResult.next()).toBeFalsy();

          const placesSQL = `SELECT * FROM ${placeEntity.name} WHERE
                    ID = :placeID1 OR ID = :placeID2`;
          const placesIDParams = {
            placeID1: placesIDs[0],
            placeID2: placesIDs[1],
          };

          const placesResult = await connection.executeQuery(
            transaction,
            placesSQL,
            placesIDParams
          );

          await placesResult.next();
          const address1 = placesResult.getString("ADDRESS");
          const expectedAddress1 = places[0].attrsValues[0] as IScalarAttrValue;
          expect(address1).toEqual(expectedAddress1.value);
          const masterKey1 = placesResult.getString(Constants.DEFAULT_MASTER_KEY_NAME);
          const expectedMasterKey1 = "";
          expect(masterKey1).toEqual(expectedMasterKey1);

          await placesResult.next();
          const address2 = placesResult.getString("ADDRESS");
          const expectedAddress2 = places[1].attrsValues[0] as IScalarAttrValue;
          expect(address2).toEqual(expectedAddress2.value);
          const masterKey2 = placesResult.getString(Constants.DEFAULT_MASTER_KEY_NAME);
          const expectedMasterKey2 = "";
          expect(masterKey2).toEqual(expectedMasterKey2);

          const userAppSetSQL = `SELECT * FROM ${appSetAttribute.adapter.crossRelation}`;
          const userAppSetResult = await connection.executeQuery(transaction, userAppSetSQL);
          expect(await userAppSetResult.next()).toBeFalsy();

          const userSQL = `SELECT * FROM ${userEntity.name}`;
          const userResult = await connection.executeQuery(transaction, userSQL);
          expect(await userResult.next()).toBeFalsy();
        }
      });

    });

  });
}