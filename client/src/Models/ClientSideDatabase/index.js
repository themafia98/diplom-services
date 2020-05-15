// @ts-nocheck
import { openDB, deleteDB } from 'idb';
import _ from 'lodash';
import config from 'config.json';
import {
  TASK_SCHEMA,
  USER_SCHEMA,
  TASK_CONTROLL_JURNAL_SCHEMA,
  WIKI_NODE_TREE,
  NEWS_SCHEMA,
} from 'Models/Schema/const';
import Schema from 'Models/Schema';

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
   * @private
   * @param {string} name
   * @param {number} version
   */

  /**
   * @private
   * @param {Array<{ entity: string, props: object }>}
   */
  #availableEntitysList = [];

  constructor(name, version) {
    this.#db = null;
    this.#name = name;
    this.#version = version;
    this.#isInit = false;
    this.#crashStatus = false;
    this.#schema = new Schema('no-strict');
    this.#availableEntitysList = [
      Object.freeze({
        entity: 'users',
        props: { unique: true, keyPath: '_id', autoIncrement: true },
        index: {
          unique: function (key) {
            return key === '_id' || key === 'email';
          },
          schema: USER_SCHEMA,
        },
      }),
      Object.freeze({
        entity: 'wikiTree',
        props: { unique: true, keyPath: 'key', autoIncrement: true },
        index: {
          unique: function (key) {
            return key === 'key';
          },
        },
        schema: WIKI_NODE_TREE,
      }),
      Object.freeze({
        entity: 'tasks',
        props: { unique: true, keyPath: 'key', autoIncrement: true },
        index: {
          unique: function (key) {
            return key === 'key';
          },
        },
        schema: TASK_SCHEMA,
      }),
      Object.freeze({
        entity: 'news',
        props: { unique: true, keyPath: 'key', autoIncrement: true },
        index: {
          unique: function (key) {
            return key === 'key';
          },
        },
        schema: NEWS_SCHEMA,
      }),
      Object.freeze({
        entity: 'jurnalworks',
        props: { unique: true, keyPath: 'key', autoIncrement: true },
        index: {
          unique: function (key) {
            return key === 'key';
          },
        },
        schema: TASK_CONTROLL_JURNAL_SCHEMA,
      }),
    ];
  }

  get db() {
    return this.#db;
  }

  set db(DB) {
    this.#db = DB;
  }

  get availableList() {
    return this.#availableEntitysList;
  }

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
        },
        async upgrade(
          db = self?.db,
          oldVersion,
          newVersion = ++self.db.version,
          transaction = self.db.transaction,
        ) {
          self.db = db;

          const newVersionUpdate = newVersion !== oldVersion && oldVersion;

          if (newVersionUpdate) {
            await deleteDB(self.getName(), {
              async blocked() {
                self.updateStateInit(false);
                console.log('Database sussesfully clear and update after error or rollback');
              },
            });
            alert('Новое обновление, приложение будет перезагружено');
            window.location.reload(true);
            return;
          }

          const storeKeyList = [];

          for await (let entity of self.availableList) {
            const { entity: key, props, index, schema: template } = entity || {};

            const isExist = self.isContains(key);
            const shouldCreate = !isExist && !newVersionUpdate;

            const store = shouldCreate
              ? await self.db.createObjectStore(key, { ...props })
              : await self.db.transaction.objectStore(key);

            if (!shouldCreate) {
              const schema = self.getSchema()?.getValidateSchema(template);
              const keys = Object.keys(schema);
              storeKeyList.push({ store, keys, index });
            }
          }

          for await (let storeParams of storeKeyList) {
            let i = 0;
            const { store, keys, index } = storeParams || {};
            for await (let key of keys) {
              if (newVersionUpdate) {
                const keysIndex = Object.keys(store.indexNames);
                const isCanDelete = keys.includes(store.indexNames[keysIndex[i]]);
                if (isCanDelete) await store.deleteIndex(key);
              }

              await store.createIndex(key, key, {
                unique: index?.unique(key),
              });
              i++;
            }
          }

          if (newVersionUpdate) console.log('Database update new version.');
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
  async getAllItems(nameStore, mode = 'readonly', query = undefined) {
    if (this.getCrashStatus()) return;
    try {
      const tx = this.db.transaction([nameStore], mode);
      const store = tx.objectStore(nameStore);
      return await store.getAll(query);
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
  async updateItem(nameStore, item, pk = null, mode = 'readwrite') {
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
