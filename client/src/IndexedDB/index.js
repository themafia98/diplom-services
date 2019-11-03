import config from "../config.json";
import { TASK_SCHEMA, USER_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from "../Utils/schema/const";
import { getValidateSchema } from "../Utils/schema";

class IndexedDB {
    constructor(name, version) {
        this.db = null;
        this.name = name;
        this.version = version;
    }

    init() {
        const requestOpen = window.indexedDB.open(this.name, this.version);
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
                keyPath: "primaryKey",
                autoIncrement: true,
            });

            let objectStoreTasks = db.createObjectStore("tasks", {
                unique: true,
                keyPath: "primaryKey",
                autoIncrement: true,
            });

            let objectStoreJurnalWork = db.createObjectStore("jurnalWork", {
                unique: true,
                keyPath: "primaryKey",
                autoIncrement: true,
            });

            const schemaUsers = getValidateSchema(USER_SCHEMA);
            const keys = Object.keys(schemaUsers);

            keys.forEach(key => {
                objectStoreUsers.createIndex(key, key, {
                    unique: key === "uuid" || key === "email" || key === "login" ? true : false,
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
    }
}

let clientDB = null;
if (window.indexedDB) {
    clientDB = new IndexedDB(config.clientDB["name"], config.clientDB["version"]);
    clientDB.init();
}
export default clientDB;
