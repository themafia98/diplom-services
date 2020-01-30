import mongoose, { Mongoose, mongo } from "mongoose";
import dotenv from "dotenv";
import _ from "lodash";

import { Dbms } from "../../Utils/Interfaces";

namespace Database {
    dotenv.config();
    export class ManagmentDatabase implements Dbms {
        private dbClient: string;
        private connectionString: string;
        private connect: Mongoose | undefined;

        public status: any = null;

        constructor(db: string, connectionString: string) {
            mongoose.set("debug", true);
            mongoose.set("useCreateIndex", true);
            this.dbClient = db;
            this.connectionString = connectionString;

            mongoose.connect(
                connectionString,
                {
                    useNewUrlParser: true,
                    useCreateIndex: true,
                    useUnifiedTopology: true,
                    keepAlive: true,
                },
                err => {
                    if (err) console.error(err);
                }
            );
        }

        public get db() {
            return this.dbClient;
        }

        public getConnectionString(): string {
            return this.connectionString;
        }

        public async connection(): Promise<any> {
            try {
                const status = mongoose.connection.readyState;
                console.log("status mongoose connect:", status);
                return mongoose.connection;

                return this.connect;
            } catch (err) {
                return this.connect;
            }
        }

        public async disconnect(): Promise<null | Mongoose> {
            if (this.getConnect()) {
                await this.getConnect().disconnect();
                return <Mongoose>this.getConnect();
            } else return null;
        }

        public getConnect(): Mongoose {
            return <Mongoose>this.connect;
        }

    }
}

export default Database;
