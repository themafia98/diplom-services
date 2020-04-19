import { openDB, deleteDB } from 'idb';
import _ from 'lodash';
import config from '../../config.json';
import {
  TASK_SCHEMA,
  USER_SCHEMA,
  TASK_CONTROLL_JURNAL_SCHEMA,
  WIKI_NODE_TREE,
  NEWS_SCHEMA,
} from '../Schema/const';
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

  isContains(name) {
    return this.db?.objectStoreNames?.contains(name);
  }

  async init() {
    if (this.getInitStatus()) return;
    const self = this;
    try {
      self.db = await openDB(self.getName(), self.getVersion(), {
        async blocking() {
          self.updateStateInit(false);
          await self.db.close();
          return await self.init();
        },
        async upgrade(
          db = self?.db,
          oldVersion = self.db.version,
          newVersion = ++self.db.version,
          transaction = self.db.transaction,
        ) {
          self.db = db;
          let isUsersObject = false;
          let isTasksObject = false;
          let isjurnalWorksObject = false;
          let isWikiTreeObject = false;
          let isNewsObject = false;

          const newVersionUpdate = newVersion !== oldVersion && oldVersion !== 0;

          if (newVersionUpdate) {
            return await deleteDB(self.getName(), {
              async blocked() {
                self.updateStateInit(false);
                console.log('Database sussesfully clear and update after error or rollback');
                return await self.init();
              },
            });
          }

          if (self.isContains('users') && !newVersionUpdate) isUsersObject = true;
          if (self.isContains('wikiTree') && !newVersionUpdate) isWikiTreeObject = true;
          if (self.isContains('tasks') && !newVersionUpdate) isTasksObject = true;
          if (self.isContains('news') && !newVersionUpdate) isNewsObject = true;
          if (self.isContains('jurnalworks') && !newVersionUpdate) isjurnalWorksObject = true;

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
                  keyPath: '_id',
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

          const objectStoreNews =
            !isNewsObject && !newVersionUpdate
              ? self.db.createObjectStore('news', {
                  unique: true,
                  keyPath: '_id',
                  autoIncrement: true,
                })
              : newVersionUpdate
              ? self.db.transaction.objectStore('news')
              : null;

          if (!isNewsObject) {
            const schemaNews = self.getSchema()?.getValidateSchema(NEWS_SCHEMA);
            const keysNews = Object.keys(schemaNews);

            keysNews.forEach((key, i) => {
              if (newVersionUpdate) {
                const keysIndex = Object.keys(objectStoreNews.indexNames);
                const isCanDelete = keysNews.includes(objectStoreNews.indexNames[keysIndex[i]]);
                if (isCanDelete) objectStoreNews.deleteIndex(key);
              }
              objectStoreNews.createIndex(key, key, {
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
      return await this.db.transaction(nameStore, mode).store.openCursor();
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
  }
}

const clientDB = new ClientSideDatabase(config.clientDB['name'], config.clientDB['version']);
if (process.env.NODE_ENV !== 'test') clientDB.init();
export { clientDB };
export default ClientSideDatabase;
