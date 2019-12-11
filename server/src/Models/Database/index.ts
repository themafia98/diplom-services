import mongoose, { Mongoose } from "mongoose";
import dotenv from "dotenv";
import _ from "lodash";
import DatabaseActions from "./actions";
import { collectionOperations } from "../../Utils/Types";
import { Dbms, ResponseMetadata, Metadata, MetadataConfig } from "../../Utils/Interfaces";

namespace Database {
    dotenv.config();
    export class ManagmentDatabase implements Dbms {
        private dbClient: string;
        private connect: Mongoose | undefined;
        private responseParams: ResponseMetadata = {};

        constructor(db: string) {
            this.dbClient = db;
        }

        public get db() {
            return this.dbClient;
        }

        private operations(name: string): collectionOperations {
            return {
                get: async (param: MetadataConfig = {}): Promise<Dbms> => {
                    const data = _.isEmpty(param) ? { name } : { name, param };
                    this.setResponseParams({ get: data });
                    return this;
                },
                put: async (param: MetadataConfig = {}): Promise<Dbms> => {
                    const data = _.isEmpty(param) ? { name } : { name, param };
                    this.setResponseParams({ put: data });
                    return this;
                },
                delete: async (param: MetadataConfig = {}): Promise<Dbms> => {
                    const data = _.isEmpty(param) ? { name } : { name, param };
                    this.setResponseParams({ delete: data });
                    return this;
                },
                update: async (param: MetadataConfig = {}): Promise<Dbms> => {
                    const data = _.isEmpty(param) ? { name } : { name, param };
                    this.setResponseParams({ update: data });
                    return this;
                },
                start: async () => {
                    const body = this.getResponseParams() || {};
                    const operationsKeys = Object.keys(body);
                    operationsKeys.forEach(
                        async operation => await DatabaseActions.routeDatabaseActions(body[operation])
                    );
                }
            };
        }

        public async connection(): Promise<void | Mongoose> {
            if (this.getConnect() || !process.env.MONGODB_URI) return <Mongoose>this.getConnect();
            this.connect = await mongoose.connect(<string>process.env.MONGODB_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                connectTimeoutMS: 1000
            });
        }

        public async disconnect(): Promise<null | Mongoose> {
            if (this.getConnect()) {
                await mongoose.disconnect();
                return <Mongoose>this.getConnect();
            } else return null;
        }

        public getConnect(): Mongoose | null {
            if (this.connect as Mongoose) return <Mongoose>this.connect;
            else return null;
        }

        public getResponseParams(): ResponseMetadata {
            return this.responseParams;
        }

        public setResponse(config: Object): Dbms {
            this.responseParams = config || {};
            return this;
        }

        public setResponseParams(param: Object | string): void {
            const key = Object.keys(param);
            if (!key) return;
            this.responseParams[<string>key[0]] = param;
        }

        public clearResponseParams(): Dbms {
            this.responseParams = {};
            return this;
        }

        public collection(name: string): collectionOperations {
            return this.operations(name);
        }
    }
}

export default Database;
