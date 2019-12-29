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
        this.crashStatus = false;
    }

    updateStateInit(state) {
        this.isInit = state;
    }

    setCrashStatus() {
        this.crashStatus = true;
    }

    getCrashStatus() {
        return this.crashStatus;
    }

    async init() {
        if (this.isInit) return;

        try {
            const indexedDatabase =
                window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            let requestOpen = indexedDatabase.open(this.name, this.version);
            requestOpen.onsuccess = event => {
                this.db = event.target.result;
                this.db.onversionchange = function() {
                    this.db.close();
                    alert("Offline data deprecated, please update page for updating storage.");
                };
            };
            requestOpen.onerror = event => {
                /** clear and reload client db if catch error */
                const deleteIndexedDbEvent = indexedDatabase.deleteDatabase(this.name);
                deleteIndexedDbEvent.onerror = event => {
                    alert("Error. Please clear your browser data or update browser.");
                    console.error(event);
                };

                deleteIndexedDbEvent.onsuccess = event => {
                    if (_.isUndefined(event.result)) {
                        this.updateStateInit(false);
                        this.init().then(() => {
                            console.log("Database sussesfully clear and update after error or rollback");
                        });
                    } else {
                        console.error(event);
                        alert(" Please clear your browser data or update browser.");
                    }
                };
            };
            requestOpen.onupgradeneeded = event => {
                this.db = event.target.result;
                const { db } = this;

                let isUsersObject = false;
                let isTasksObject = false;
                let isJurnalWorkObject = false;

                const newVersionUpdate = event.newVersion !== event.oldVersion && event.oldVersion !== 0;

                if (newVersionUpdate) {
                    indexedDB.deleteDatabase(this.db);
                    return void this.init();
                }

                if (db.objectStoreNames.contains("users") && !newVersionUpdate) isUsersObject = true;
                if (db.objectStoreNames.contains("tasks") && !newVersionUpdate) isTasksObject = true;
                if (db.objectStoreNames.contains("jurnalWork") && !newVersionUpdate) isJurnalWorkObject = true;

                const objectStoreUsers =
                    !isUsersObject && !newVersionUpdate
                        ? db.createObjectStore("users", {
                              unique: true,
                              keyPath: "_id",
                              autoIncrement: true
                          })
                        : newVersionUpdate
                        ? requestOpen.transaction.objectStore("users")
                        : null;

                if (!isUsersObject) {
                    const schemaUsers = getValidateSchema(USER_SCHEMA);
                    const keysUsers = Object.keys(schemaUsers);

                    keysUsers.forEach((key, i) => {
                        if (newVersionUpdate) {
                            const keysIndex = Object.keys(objectStoreUsers.indexNames);
                            const isCanDelete = keysUsers.includes(objectStoreUsers.indexNames[keysIndex[i]]);
                            if (isCanDelete) objectStoreUsers.deleteIndex(key);
                        }
                        objectStoreUsers.createIndex(key, key, {
                            unique: key === "_id" || key === "email" ? true : false
                        });
                    });
                }

                const objectStoreTasks =
                    !isTasksObject && !newVersionUpdate
                        ? db.createObjectStore("tasks", {
                              unique: true,
                              keyPath: "key",
                              autoIncrement: true
                          })
                        : newVersionUpdate
                        ? requestOpen.transaction.objectStore("tasks")
                        : null;

                if (!isTasksObject) {
                    const schemaTasks = getValidateSchema(TASK_SCHEMA);
                    const keysTasks = Object.keys(schemaTasks);

                    keysTasks.forEach((key, i) => {
                        if (newVersionUpdate) {
                            const keysIndex = Object.keys(objectStoreTasks.indexNames);
                            const isCanDelete = keysTasks.includes(objectStoreTasks.indexNames[keysIndex[i]]);
                            if (isCanDelete) objectStoreTasks.deleteIndex(key);
                        }
                        objectStoreTasks.createIndex(key, key, {
                            unique: key === "key" ? true : false
                        });
                    });
                }

                const objectStoreJurnalWork =
                    !isJurnalWorkObject && !newVersionUpdate
                        ? db.createObjectStore("jurnalWork", {
                              unique: true,
                              keyPath: "id",
                              autoIncrement: true
                          })
                        : newVersionUpdate
                        ? requestOpen.transaction.objectStore("jurnalWork")
                        : null;

                if (!isJurnalWorkObject) {
                    const schemaJurnalWork = getValidateSchema(TASK_CONTROLL_JURNAL_SCHEMA);
                    const keysJurnalWork = Object.keys(schemaJurnalWork);

                    keysJurnalWork.forEach((key, i) => {
                        if (newVersionUpdate) {
                            const keysIndex = Object.keys(objectStoreJurnalWork.indexNames);
                            const isCanDelete = keysJurnalWork.includes(objectStoreJurnalWork.indexNames[keysIndex[i]]);
                            if (isCanDelete) objectStoreJurnalWork.deleteIndex(key);
                        }
                        objectStoreJurnalWork.createIndex(key, key, {
                            unique: key === "id" ? true : false
                        });
                    });
                }

                if (newVersionUpdate) {
                    console.log("Database update new version.");
                }
            };

            this.isInit = true;
        } catch (e) {
            console.error(e);
            this.isInit = true;
            this.setCrashStatus();
        }
    }

    getItemByKey(nameStore, key, mode = "readonly") {
        if (this.getCrashStatus()) return;
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
        if (this.getCrashStatus()) return;
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
        if (this.getCrashStatus()) return;
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

    updateItem(nameStore, item, pk, mode = "readwrite") {
        if (this.getCrashStatus()) return;

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
        if (this.getCrashStatus()) return;
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
        if (this.getCrashStatus()) return;
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
