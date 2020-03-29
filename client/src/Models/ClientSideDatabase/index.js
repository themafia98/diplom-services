import _ from 'lodash';
import config from '../../config.json';
import { TASK_SCHEMA, USER_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from '../Schema/const';
import Schema from '../Schema';

class ClientSideDatabase {
  #db = null;
  #name = null;
  #version = null;
  #isInit = false;
  #crashStatus = false;
  #schema = null;
  /**
   * @param {string} name
   * @param {number} version
   */
  constructor(name, version) {
    this.#db = null;
    this.#name = name;
    this.#version = version;
    this.#isInit = false;
    this.#crashStatus = false;
    this.#schema = new Schema('no-strict');
  }

  /**
   * @param {boolean} state
   */
  updateStateInit(state) {
    this.#isInit = state;
  }

  setCrashStatus() {
    this.#crashStatus = true;
  }

  getCrashStatus() {
    return this.#crashStatus;
  }

  getName() {
    return this.#name;
  }

  getSchema() {
    return this.#schema;
  }

  getDb() {
    return this.#db;
  }

  getInitStatus() {
    return this.#isInit;
  }

  getVersion() {
    return this.#version;
  }

  async init() {
    if (this.getInitStatus()) return;

    try {
      const indexedDatabase =
        window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      let requestOpen = indexedDatabase.open(this.getName(), this.getVersion());
      /**
       * @param {{ target: { result: any; }; }} event
       */
      requestOpen.onsuccess = event => {
        this.#db = event?.target?.result;
        this.#db.onversionchange = function() {
          this.getDb().close();
          alert('Offline data deprecated, please update page for updating storage.');
        };
      };
      /**
       * @param {any} event
       */
      requestOpen.onerror = event => {
        /** clear and reload client db if catch error */
        const deleteIndexedDbEvent = indexedDatabase.deleteDatabase(this.getName());
        /**
         * @param {any} event
         */
        deleteIndexedDbEvent.onerror = event => {
          alert('Error. Please clear your browser data or update browser.');
          console.error(event);
        };

        /**
         * @param {{ result: any; }} event
         */
        deleteIndexedDbEvent.onsuccess = event => {
          if (_.isUndefined(event.result)) {
            this.updateStateInit(false);
            this.init().then(() => {
              console.log('Database sussesfully clear and update after error or rollback');
            });
          } else {
            console.error(event);
            alert(' Please clear your browser data or update browser.');
          }
        };
      };
      /**
       * @param {{ target: { result: any; }; newVersion: any; oldVersion: number; }} event
       */
      requestOpen.onupgradeneeded = event => {
        this.#db = event?.target.result;
        let isUsersObject = false;
        let isTasksObject = false;
        let isjurnalWorksObject = false;

        const newVersionUpdate = event.newVersion !== event.oldVersion && event.oldVersion !== 0;

        if (newVersionUpdate) {
          indexedDB.deleteDatabase(this.#db);
          return void this.init();
        }

        if (this.getDb().objectStoreNames.contains('users') && !newVersionUpdate) isUsersObject = true;
        if (this.getDb().objectStoreNames.contains('tasks') && !newVersionUpdate) isTasksObject = true;
        if (this.getDb().objectStoreNames.contains('jurnalworks') && !newVersionUpdate)
          isjurnalWorksObject = true;

        const objectStoreUsers =
          !isUsersObject && !newVersionUpdate
            ? this.getDb().createObjectStore('users', {
                unique: true,
                keyPath: '_id',
                autoIncrement: true,
              })
            : newVersionUpdate
            ? requestOpen.transaction.objectStore('users')
            : null;

        if (!isUsersObject) {
          const schemaUsers = this.getSchema()?.getValidateSchema(USER_SCHEMA);
          const keysUsers = Object.keys(schemaUsers);

          keysUsers.forEach((key, i) => {
            if (newVersionUpdate) {
              const keysIndex = Object.keys(objectStoreUsers.indexNames);
              const isCanDelete = keysUsers.includes(objectStoreUsers.indexNames[keysIndex[i]]);
              if (isCanDelete) objectStoreUsers.deleteIndex(key);
            }
            objectStoreUsers.createIndex(key, key, {
              unique: key === '_id' || key === 'email' ? true : false,
            });
          });
        }

        const objectStoreTasks =
          !isTasksObject && !newVersionUpdate
            ? this.getDb().createObjectStore('tasks', {
                unique: true,
                keyPath: 'key',
                autoIncrement: true,
              })
            : newVersionUpdate
            ? requestOpen.transaction.objectStore('tasks')
            : null;

        if (!isTasksObject) {
          const schemaTasks = this.getSchema()?.getValidateSchema(TASK_SCHEMA);
          const keysTasks = Object.keys(schemaTasks);

          keysTasks.forEach((key, i) => {
            if (newVersionUpdate) {
              const keysIndex = Object.keys(objectStoreTasks.indexNames);
              const isCanDelete = keysTasks.includes(objectStoreTasks.indexNames[keysIndex[i]]);
              if (isCanDelete) objectStoreTasks.deleteIndex(key);
            }
            objectStoreTasks.createIndex(key, key, {
              unique: key === 'key' ? true : false,
            });
          });
        }

        const objectStorejurnalWorks =
          !isjurnalWorksObject && !newVersionUpdate
            ? this.getDb().createObjectStore('jurnalworks', {
                unique: true,
                keyPath: 'id',
                autoIncrement: true,
              })
            : newVersionUpdate
            ? requestOpen.transaction.objectStore('jurnalworks')
            : null;

        if (!isjurnalWorksObject) {
          const schemajurnalWorks = this.getSchema()?.getValidateSchema(TASK_CONTROLL_JURNAL_SCHEMA);
          const keysjurnalWorks = Object.keys(schemajurnalWorks);

          keysjurnalWorks.forEach((key, i) => {
            if (newVersionUpdate) {
              const keysIndex = Object.keys(objectStorejurnalWorks.indexNames);
              const isCanDelete = keysjurnalWorks.includes(objectStorejurnalWorks.indexNames[keysIndex[i]]);
              if (isCanDelete) objectStorejurnalWorks.deleteIndex(key);
            }
            objectStorejurnalWorks.createIndex(key, key, {
              unique: key === 'id' ? true : false,
            });
          });
        }

        if (newVersionUpdate) {
          console.log('Database update new version.');
        }
      };

      this.#isInit = true;
    } catch (e) {
      console.error(e);
      this.#isInit = true;
      this.setCrashStatus();
    }
  }

  /**
   * @param {any} nameStore
   * @param {any} key
   */
  getItemByKey(nameStore, key, mode = 'readonly') {
    if (this.getCrashStatus()) return;
    const tx = this.getDb().transaction([nameStore], mode);
    const store = tx.objectStore(nameStore);
    return store.get(key);

    /** @Example */
    // const item = clientDB.getItemByKey("jurnalworks", "31232");
    // item.onsuccess = event => {
    //     const {
    //         target: { result },
    //     } = event;
    //     console.log("By key:", result);
    // };
  }

  /**
   * @param {any} nameStore
   */
  getAllItems(nameStore, mode = 'readonly') {
    if (this.getCrashStatus()) return;
    const tx = this.getDb().transaction([nameStore], mode);
    const store = tx.objectStore(nameStore);
    return store.getAll();

    /** @Example */
    // const items = clientDB.getAllItems("jurnalworks");
    // items.onsuccess = event => {
    //     const {
    //         target: { result },
    //     } = event;
    //     console.log(result);
    // };
  }

  /**
   * @param {any} nameStore
   * @param {any} item
   */
  addItem(nameStore, item, mode = 'readwrite') {
    try {
      if (this.getCrashStatus()) return;
      const tx = this.getDb().transaction([nameStore], mode);
      const store = tx.objectStore(nameStore);
      return store.add(item);
    } catch (err) {
      console.warn(err.message);
    }

    /** @Example */
    // const putAction = clientDB.addItem("jurnalworks", {
    //     key: "1231312asd",
    //     timeLost: Math.random(),
    //     date: null,
    //     description: null,
    // });
    // putAction.onsuccess = event => {
    //     const {
    //         target: { result },
    //     } = event;
    //     console.log(`Put item ${result} done.`);
    // };
  }

  /**
   * @param {any} nameStore
   * @param {any} item
   * @param {any} pk
   */
  updateItem(nameStore, item, pk, mode = 'readwrite') {
    if (this.getCrashStatus()) return;

    const tx = this.getDb().transaction([nameStore], mode);
    const store = tx.objectStore(nameStore);
    return store.put(item);

    /** @Example */
    // const putAction = clientDB.updateItem("jurnalworks", {
    //     key: "1231312asd",
    //     timeLost: Math.random(),
    //     date: null,
    //     description: null,
    // });
    // putAction.onsuccess = event => {
    //     const {
    //         target: { result },
    //     } = event;
    //     console.log(`Update item ${result} done.`);
    // };
  }

  /**
   * @param {any} key
   */
  deleteItem(nameStore = '', key, mode = 'readwrite') {
    if (this.getCrashStatus()) return;
    const tx = this.getDb().transaction([nameStore], mode);
    const store = tx.objectStore(nameStore);
    return store.delete(key);

    /** @Example */
    // const deleteKey = "1231312asd";
    // const deleteAction = clientDB.deleteItem("jurnalworks", deleteKey);
    // deleteAction.onsuccess = event => {
    //     const {
    //         target: { readyState },
    //     } = event;
    //     console.log(`Delete item ${deleteKey} ${readyState}`);
    // };
  }

  getCursor(nameStore = '', mode = 'readonly') {
    if (this.getCrashStatus()) return;
    const tx = this.getDb().transaction(nameStore, mode);
    const store = tx.objectStore(nameStore);
    return store.openCursor();

    /** @Example */
    // const deleteAction = clientDB.getCursor("jurnalworks");
    // deleteAction.onsuccess = event => {
    //     const {
    //         target: { result: cursor },
    //     } = event;
    //     if (!cursor) return console.log("cursor end");
    //     console.log("Cursored at:", cursor.key);
    //     for (let field in cursor.value) {
    //         // console.log(cursor.value[field]);
    //     }

    //     cursor.continue();
    // };
  }

  /**
   * @param {any} nameStore
   */
  searchItemsByIndexRange(index = null, lowerKey = null, upperKey = null, nameStore, mode = 'readonly') {
    if (this.getCrashStatus()) return;
    if (_.isNull(lowerKey) && _.isNull(upperKey) && _.isNull(index)) return;
    let searchKeyRange = null;

    if (_.isNull(lowerKey) && !_.isNull(upperKey)) searchKeyRange = IDBKeyRange.upperBound(upperKey);
    else if (_.isNull(upperKey) && !_.isNull(lowerKey)) searchKeyRange = IDBKeyRange.lowerBound(lowerKey);
    else searchKeyRange = IDBKeyRange.bound(lowerKey, upperKey);
    if (!searchKeyRange) return;
    const tx = this.getDb().transaction([nameStore], mode);
    const store = tx.objectStore(nameStore);
    const searchIndex = store.index(index);
    return searchIndex.openCursor(searchKeyRange);

    /** @Example */
    // const searchByIndexRange = clientDB.searchItemsByIndexRange("timeLost", 0, 0.7, "jurnalworks");
    // searchByIndexRange.onsuccess = event => {
    //     const {
    //         target: { result: cursor },
    //     } = event;
    //     if (!cursor) return console.log("cursor end");
    //     console.log("SearchByIndexRande. Cursored at:", cursor.key);
    //     for (let field in cursor.value) {
    //         // console.log(cursor.value[field]);
    //     }

    //     cursor.continue();
    // };
  }
}

let clientDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
if (clientDB) {
  clientDB = new ClientSideDatabase(config.clientDB['name'], config.clientDB['version']);
  clientDB.init();
}
export { clientDB };
export default ClientSideDatabase;
