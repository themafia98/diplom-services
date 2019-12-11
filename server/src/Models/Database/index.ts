import mongoose from "mongoose";
import { Dbms } from "../../Utils/Interfaces";

namespace Database {
    class ManagmentDatabase implements Dbms {
        private connect: string;

        constructor(connectionString: string) {
            this.connect = connectionString;
        }

        public getConnect() {
            return this.connect;
        }

        public getData(config: Object): Object {
            return {};
        }

        public putData(config: Object): boolean {
            return true;
        }

        public deleteData(config: Object): boolean {
            return true;
        }

        public updateData(config: Object): boolean {
            return true;
        }
    }
}

export default Database;
