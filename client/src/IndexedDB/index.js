import config from "../config.json";
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
            // const customerData = [
            //     { primaryKey: Math.random(), name: "Bill", age: 35, email: "bill@company.com" },
            //     { primaryKey: Math.random(), name: "Donna", age: 32, email: "donna@home.org" },
            // ];

            let objectStore = db.createObjectStore("users", {
                unique: true,
                keyPath: "primaryKey",
                autoIncrement: true,
            });
            //objectStore.createIndex("name", "name", { unique: false });
            //objectStore.createIndex("email", "email", { unique: true });

            // objectStore.transaction.oncomplete = function(event) {
            //     // Store values in the newly created objectStore.
            //     var customerObjectStore = db.transaction("users", "readwrite").objectStore("users");
            //     customerData.forEach(function(customer) {
            //         customerObjectStore.add(customer);
            //     });
            // };
        };
    }
}

let clientDB = null;
if (window.indexedDB) {
    clientDB = new IndexedDB(config.clientDB["name"], config.clientDB["version"]);
    clientDB.init();
}
export default clientDB;
