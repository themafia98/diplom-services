import { openDB, deleteDB, wrap, unwrap } from 'idb';
import _ from 'lodash';
import config from '../../config.json';
import { TASK_SCHEMA, USER_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA, WIKI_NODE_TREE } from '../Schema/const';
import Schema from '../Schema';

class ClientSideDatabase {
  /**
   * @private
   * @type {object|null}
   */
  #db = null;
  /**
   * @private
   * @type {string|null}
   */
  #name = null;
  /**
   * @private
   * @type {number|null}
   */
  #version = null;
  /**
   * @private
   * @type {boolean}
   */
  #isInit = false;
  /**
   * @private
   * @type {boolean}
   */
  #crashStatus = false;
  /**
   * @private
   * @type {Schema}
   */
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

  get db() {
    return this.#db;
  }

  set db(DB) {
    this.#db = DB;
  }

  getInitStatus() {
    return this.#isInit;
  }

  getVersion() {
    return this.#version;
  }

  async init() {
    if (this.getInitStatus()) return;
    const self = this;
    try {
      self.db = await openDB(this.getName(), this.getVersion(), {
        blocking() {
          self.db.close();
          alert('Offline data deprecated, please update page for updating storage.');
        },
        upgrade(db, oldVersion, newVersion, transaction) {
          self.db = db;
          let isUsersObject = false;
          let isTasksObject = false;
          let isjurnalWorksObject = false;
          let isWikiTreeObject = false;

          const newVersionUpdate = newVersion !== oldVersion && oldVersion !== 0;

          if (newVersionUpdate) {
            indexedDB.deleteDatabase(self.db);
            return void self.init();
          }

          if (self.db?.objectStoreNames.contains('users') && !newVersionUpdate) isUsersObject = true;
          if (self.db?.objectStoreNames.contains('wikiTree') && !newVersionUpdate) isWikiTreeObject = true;
          if (self.db?.objectStoreNames.contains('tasks') && !newVersionUpdate) isTasksObject = true;
          if (self.db?.objectStoreNames.contains('jurnalworks') && !newVersionUpdate)
            isjurnalWorksObject = true;

          const objectStoreUsers =
            !isUsersObject && !newVersionUpdate
              ? self.db?.createObjectStore('users', {
                  unique: true,
                  keyPath: '_id',
                  autoIncrement: true,
                })
              : newVersionUpdate
              ? self.db.transaction.objectStore('users')
              : null;

          if (!isUsersObject) {
            const schemaUsers = self.getSchema()?.getValidateSchema(USER_SCHEMA);
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
              ? self.db.createObjectStore('tasks', {
                  unique: true,
                  keyPath: 'key',
                  autoIncrement: true,
                })
              : newVersionUpdate
              ? self.db.transaction.objectStore('tasks')
              : null;

          if (!isTasksObject) {
            const schemaTasks = self.getSchema()?.getValidateSchema(TASK_SCHEMA);
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

          const objectStoreWikiTree =
            !isWikiTreeObject && !newVersionUpdate
              ? self.db.createObjectStore('wikiTree', {
                  unique: true,
                  keyPath: 'key',
                  autoIncrement: true,
                })
              : newVersionUpdate
              ? self.db.transaction.objectStore('wikiTree')
              : null;

          if (!isWikiTreeObject) {
            const schemaWikiTree = self.getSchema()?.getValidateSchema(WIKI_NODE_TREE);
            const keysWikiTree = Object.keys(schemaWikiTree);

            keysWikiTree.forEach((key, i) => {
              if (newVersionUpdate) {
                const keysIndex = Object.keys(objectStoreWikiTree.indexNames);
                const isCanDelete = keysWikiTree.includes(objectStoreWikiTree.indexNames[keysIndex[i]]);
                if (isCanDelete) objectStoreWikiTree.deleteIndex(key);
              }
              objectStoreWikiTree.createIndex(key, key, {
                unique: key === 'key' ? true : false,
              });
            });
          }

          const objectStorejurnalWorks =
            !isjurnalWorksObject && !newVersionUpdate
              ? self.db.createObjectStore('jurnalworks', {
                  unique: true,
                  keyPath: 'id',
                  autoIncrement: true,
                })
              : newVersionUpdate
              ? self.db.transaction.objectStore('jurnalworks')
              : null;

          if (!isjurnalWorksObject) {
            const schemajurnalWorks = self.getSchema()?.getValidateSchema(TASK_CONTROLL_JURNAL_SCHEMA);
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
        },
      });

      // } else {
      //   /** clear and reload client db if catch error */
      //   const deleteIndexedDbEvent = deleteDB(self.getName());
      //   /**
      //    * @param {any} event
      //    */
      //   deleteIndexedDbEvent.onerror = event => {
      //     alert('Error. Please clear your browser data or update browser.');
      //     console.error(event);
      //   };

      //   deleteIndexedDbEvent.onsuccess = ({ result }) => {
      //     if (_.isUndefined(result)) {
      //       self.updateStateInit(false);
      //       self.init().then(() => {
      //         console.log('Database sussesfully clear and update after error or rollback');
      //       });
      //     } else {
      //       alert(' Please clear your browser data or update browser.');
      //     }
      //   };
      // }

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
  async getItemByKey(nameStore, key, mode = 'readonly') {
    if (this.getCrashStatus()) return;
    try {
      const tx = this.db.transaction([nameStore], mode);
      const store = tx.objectStore(nameStore);
      return await store.get(key);
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  /**
   * @param {any} nameStore
   */
  async getAllItems(nameStore, mode = 'readonly') {
    if (this.getCrashStatus()) return;
    try {
      const tx = this.db.transaction([nameStore], mode);
      const store = tx.objectStore(nameStore);
      return await store.getAll();
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  /**
   * @param {any} nameStore
   * @param {any} item
   */
  async addItem(nameStore, item, mode = 'readwrite') {
    try {
      if (this.getCrashStatus()) return;
      const tx = this.db.transaction([nameStore], mode);
      const store = tx.objectStore(nameStore);
      return await store.add(item);
    } catch (err) {
      console.warn(err.message);
      return null;
    }
  }

  /**
   * @param {any} nameStore
   * @param {any} item
   * @param {any} pk
   */
  async updateItem(nameStore, item, pk, mode = 'readwrite') {
    if (this.getCrashStatus()) return;

    try {
      const tx = this.db.transaction([nameStore], mode);
      const store = tx.objectStore(nameStore);
      return await store.put(item);
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  /**
   * @param {any} key
   */
  async deleteItem(nameStore = '', key, mode = 'readwrite') {
    if (this.getCrashStatus()) return;
    try {
      const tx = this.db.transaction([nameStore], mode);
      const store = tx.objectStore(nameStore);
      return await store.delete(key);
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  async getCursor(nameStore = '', mode = 'readonly') {
    if (this.getCrashStatus()) return;
    try {
      const tx = this.db.transaction(nameStore, mode);
      const store = tx.objectStore(nameStore);
      return await store.openCursor();
    } catch (error) {
      console.error(error.message);
      return null;
    }
  }

  /**
   * @param {any} nameStore
   */
  async searchItemsByIndexRange(
    index = null,
    lowerKey = null,
    upperKey = null,
    nameStore,
    mode = 'readonly',
  ) {
    if (this.getCrashStatus()) return;
    if (_.isNull(lowerKey) && _.isNull(upperKey) && _.isNull(index)) return;
    let searchKeyRange = null;

    if (_.isNull(lowerKey) && !_.isNull(upperKey)) searchKeyRange = IDBKeyRange.upperBound(upperKey);
    else if (_.isNull(upperKey) && !_.isNull(lowerKey)) searchKeyRange = IDBKeyRange.lowerBound(lowerKey);
    else searchKeyRange = IDBKeyRange.bound(lowerKey, upperKey);
    if (!searchKeyRange) return;
    const tx = this.db.transaction([nameStore], mode);
    const store = tx.objectStore(nameStore);
    const searchIndex = store.index(index);
    return await searchIndex.openCursor(searchKeyRange);

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

const clientDB = new ClientSideDatabase(config.clientDB['name'], config.clientDB['version']);
clientDB.init();
export { clientDB };
export default ClientSideDatabase;
