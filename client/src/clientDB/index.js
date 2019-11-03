import _ from "lodash";
import config from "../config.json";
import { TASK_SCHEMA, USER_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from "../Utils/schema/const";
import { getValidateSchema } from "../Utils/schema";

class ClientDB {
    constructor(name, version) {
        this.db = null;
        this.name = name;
        this.version = version;
        this.isInit = false;
    }

    init() {
        if (this.isInit) return;
        const indexedDatabase = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        const requestOpen = indexedDatabase.open(this.name, this.version);
        requestOpen.onsuccess = event => {
            this.db = event.target.result;
        };
        requestOpen.onerror = event => {
            console.error("Error open indexed db");
        };
        requestOpen.onupgradeneeded = event => {
            this.db = event.target.result;
            const { db } = this;

            let objectStoreUsers = db.createObjectStore("users", {
                unique: true,
                keyPath: "uuid",
                autoIncrement: true,
            });

            let objectStoreTasks = db.createObjectStore("tasks", {
                unique: true,
                keyPath: "key",
                autoIncrement: true,
            });

            let objectStoreJurnalWork = db.createObjectStore("jurnalWork", {
                unique: true,
                keyPath: "key",
                autoIncrement: true,
            });

            const schemaUsers = getValidateSchema(USER_SCHEMA);
            const keys = Object.keys(schemaUsers);

            keys.forEach(key => {
                objectStoreUsers.createIndex(key, key, {
                    unique: key === "uuid" || key === "email" ? true : false,
                });
            });

            const schemaTasks = getValidateSchema(TASK_SCHEMA);
            const keysTasks = Object.keys(schemaTasks);

            keysTasks.forEach(key => {
                objectStoreTasks.createIndex(key, key, {
                    unique: key === "key" ? true : false,
                });
            });

            const schemaJurnalWork = getValidateSchema(TASK_CONTROLL_JURNAL_SCHEMA);
            const keysJurnalWork = Object.keys(schemaJurnalWork);

            keysJurnalWork.forEach(key => {
                objectStoreJurnalWork.createIndex(key, key, {
                    unique: key === "key" ? true : false,
                });
            });
        };

        this.isInit = true;
    }

    getItemByKey(nameStore, key, mode = "readonly") {
        const tx = this.db.transaction([nameStore], mode);
        const store = tx.objectStore(nameStore);
        return store.get(key);

        /** @Example */
        // const item = clientDB.getItemByKey("jurnalWork", "31232");
        // item.onsuccess = event => {
        //     const {
        //         target: { result },
        //     } = event;
        //     console.log("By key:", result);
        // };
    }

    getAllItems(nameStore, mode = "readonly") {
        const tx = this.db.transaction([nameStore], mode);
        const store = tx.objectStore(nameStore);
        return store.getAll();

        /** @Example */
        // const items = clientDB.getAllItems("jurnalWork");
        // items.onsuccess = event => {
        //     const {
        //         target: { result },
        //     } = event;
        //     console.log(result);
        // };
    }

    addItem(nameStore, item, mode = "readwrite") {
        const tx = this.db.transaction([nameStore], mode);
        const store = tx.objectStore(nameStore);
        return store.add(item);

        /** @Example */
        // const putAction = clientDB.addItem("jurnalWork", {
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

    updateItem(nameStore, item, mode = "readwrite") {
        const tx = this.db.transaction([nameStore], mode);
        const store = tx.objectStore(nameStore);
        return store.put(item);

        /** @Example */
        // const putAction = clientDB.updateItem("jurnalWork", {
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

    deleteItem(nameStore, key, mode = "readwrite") {
        const tx = this.db.transaction([nameStore], mode);
        const store = tx.objectStore(nameStore);
        return store.delete(key);

        /** @Example */
        // const deleteKey = "1231312asd";
        // const deleteAction = clientDB.deleteItem("jurnalWork", deleteKey);
        // deleteAction.onsuccess = event => {
        //     const {
        //         target: { readyState },
        //     } = event;
        //     console.log(`Delete item ${deleteKey} ${readyState}`);
        // };
    }

    getCursor(nameStore, mode = "readonly") {
        const tx = this.db.transaction(nameStore, mode);
        const store = tx.objectStore(nameStore);
        return store.openCursor();

        /** @Example */
        // const deleteAction = clientDB.getCursor("jurnalWork");
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

    searchItemsByIndexRange(index = null, lowerKey = null, upperKey = null, nameStore, mode = "readonly") {
        if (_.isNull(lowerKey) && _.isNull(upperKey) && _.isNull(index)) return;
        let searchKeyRange = null;

        if (_.isNull(lowerKey) && !_.isNull(upperKey)) searchKeyRange = IDBKeyRange.upperBound(upperKey);
        else if (_.isNull(upperKey) && !_.isNull(lowerKey)) searchKeyRange = IDBKeyRange.lowerBound(lowerKey);
        else searchKeyRange = IDBKeyRange.bound(lowerKey, upperKey);
        if (!searchKeyRange) return;
        const tx = this.db.transaction([nameStore], mode);
        const store = tx.objectStore(nameStore);
        const searchIndex = store.index(index);
        return searchIndex.openCursor(searchKeyRange);

        /** @Example */
        // const searchByIndexRange = clientDB.searchItemsByIndexRange("timeLost", 0, 0.7, "jurnalWork");
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
    clientDB = new ClientDB(config.clientDB["name"], config.clientDB["version"]);
    clientDB.init();
}
export default clientDB;
