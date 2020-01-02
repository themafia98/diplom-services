import mongoose, { Mongoose, DocumentQuery, Document } from "mongoose";
import dotenv from "dotenv";
import _ from "lodash";
import DatabaseActions from "./actions";
import { collectionOperations, schemaConfig } from "../../Utils/Types";
import { Dbms, ResponseMetadata, MetadataConfig, BuilderData } from "../../Utils/Interfaces";

namespace Database {
    dotenv.config();
    export class ManagmentDatabase implements Dbms {
        private dbClient: string;
        private connectionString: string;
        private connect: Mongoose | undefined;
        private responseParams: ResponseMetadata = {};

        public status: any = null;

        constructor(db: string, connectionString: string) {
            mongoose.set("debug", true);
            mongoose.set("useCreateIndex", true);
            this.dbClient = db;
            this.connectionString = connectionString;
        }

        private operations(collection: string): collectionOperations {
            return {
                get: (param: MetadataConfig = { methodQuery: "all" }): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ GET: data });
                    return this.operations(collection);
                },
                post: (param: MetadataConfig = { methodQuery: "all" }): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ POST: data });
                    return this.operations(collection);
                },
                set: (param: MetadataConfig = { methodQuery: "set_single" }): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ SET: data });
                    return this.operations(collection);
                },
                delete: (param: MetadataConfig = { methodQuery: "all" }): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ DELETE: data });
                    return this.operations(collection);
                },
                update: (param: MetadataConfig = { methodQuery: "all" }): collectionOperations => {
                    const data = _.isEmpty(param) ? { collection } : { collection, param };
                    this.setResponseParams({ UPDATE: data });
                    return this.operations(collection);
                },
                start: async (
                    configSchema: schemaConfig,
                    callback: Function
                ): Promise<DocumentQuery<any, Document> | null> => {
                    const responseKeys: Array<string> = Object.keys(this.getResponseParams());
                    const responseBuilder: Function = DatabaseActions.routeDatabaseActions();
                    const paramsArray: Array<object> = [];
                    responseKeys.forEach(async (method: any, index: number) => {
                        const operation: ResponseMetadata = this.getResponseParams()[method][method];
                        const build: BuilderData = await responseBuilder(operation, method, configSchema);
                        const response = !_.isEmpty(build) ? build[method] || {} : {};
                        const { err = null, param = {} } = response;
                        if (responseKeys.length > 1) paramsArray[method] = param;
                        if (responseKeys.length === index + 1) {
                            this.clearResponseParams();
                            callback(err, build, paramsArray.length ? paramsArray : param);
                        }
                    });
                }
            }
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
