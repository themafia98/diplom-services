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

        private operations(collection: string): collectionOperations {
            return {
                get: (param: MetadataConfig = {}): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ GET: data });
                    return this.operations(collection);
                },
                post: (param: MetadataConfig = {}): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ POST: data });
                    return this.operations(collection);
                },
                put: (param: MetadataConfig = {}): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ PUT: data });
                    return this.operations(collection);
                },
                delete: (param: MetadataConfig = {}): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ DELETE: data });
                    return this.operations(collection);
                },
                update: (param: MetadataConfig = {}): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ UPDATE: data });
                    return this.operations(collection);
                },
                start: async () => {
                    Object.keys(this.getResponseParams()).forEach(async param => {
                        await DatabaseActions.routeDatabaseActions(
                            Object.assign(this.getResponseParams()[param][param], {
                                method: Object.keys(this.getResponseParams()[param])[0]
                            })
                        );
                    });
                }
            };
        }

        public async connection(): Promise<void | Mongoose> {
            if (this.getConnect() || !process.env.MONGODB_URI) return <Mongoose>this.getConnect();
            try {
                this.connect = await mongoose.connect(<string>process.env.MONGODB_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
            } catch (err) {
                console.log(err);
            }
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
            this.responseParams[<string>key[0]] = Object.assign(param, {});
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
