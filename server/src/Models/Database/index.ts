import mongoose, { Mongoose } from "mongoose";
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
            //  mongoose.set("debug", true);
            mongoose.set("useCreateIndex", true);
            this.dbClient = db;
            this.connectionString = connectionString;
        }

        public get db() {
            return this.dbClient;
        }

        public getConnectionString(): string {
            return this.connectionString;
        }

        public async connection(): Promise<void | Mongoose> {
            if (!this.getConnectionString()) return <Mongoose>this.getConnect();
            try {
                this.connect = await mongoose.connect(
                    this.getConnectionString(),
                    {
                        useNewUrlParser: true,
                        useCreateIndex: true,
                        useUnifiedTopology: true
                    },
                    err => {
                        if (err) console.error(err);
                    }
                );
                return this.connect;
            } catch (err) {
                return void console.error(err);
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
