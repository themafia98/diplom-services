import mongoose, { Mongoose } from "mongoose";
import dotenv from "dotenv";
import _ from "lodash";
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

        public setResponse(config: Object = {}): Dbms {
            this.responseParams = config;
            return this;
        }

        public setResponseParams(key: string, param: Object | string) {
            this.responseParams[key] = param;
        }

        public clearResponseParams(): Dbms {
            this.responseParams = {};
            return this;
        }

        public collection(name: string): collectionOperations {
            return {
                get: async (param: MetadataConfig = {}): Promise<Dbms> => {
                    const data = _.isEmpty(param) ? await this.getData({ name }) : await this.getData({ name, param });
                    return this;
                },
                put: async (param: MetadataConfig = {}): Promise<Dbms> => {
                    const data = _.isEmpty(param) ? await this.putData({ name }) : await this.putData({ name, param });
                    return this;
                },
                delete: async (param: MetadataConfig = {}): Promise<Dbms> => {
                    const data = _.isEmpty(param)
                        ? await this.deleteData({ name })
                        : await this.deleteData({ name, param });
                    return this;
                },
                update: async (param: MetadataConfig = {}): Promise<Dbms> => {
                    const data = _.isEmpty(param)
                        ? await this.updateData({ name })
                        : await this.updateData({ name, param });
                    return this;
                }
            };
        }

        private async getData(config: MetadataConfig): Promise<Metadata> {
            return {};
        }

        private async putData(config: MetadataConfig): Promise<boolean> {
            return true;
        }

        private async deleteData(config: MetadataConfig): Promise<boolean> {
            return true;
        }

        private async updateData(config: MetadataConfig): Promise<boolean> {
            return true;
        }
    }
}

export default Database;
