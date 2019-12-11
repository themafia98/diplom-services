import mongoose from "mongoose";
import _ from "lodash";
import { collectionOperations } from "../../Utils/Types";
import { Dbms, ResponseMetadata } from "../../Utils/Interfaces";

namespace Database {
    class ManagmentDatabase implements Dbms {
        private connect: string;
        private responseParams: ResponseMetadata = {};

        constructor(connectionString: string) {
            this.connect = connectionString;
        }

        public getConnect() {
            return this.connect;
        }

        public getResponseParams(): ResponseMetadata {
            return this.responseParams;
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
                get: async (param?: Object): Promise<Dbms> => {
                    const data = _.isEmpty(param) ? await this.getData({ name }) : await this.getData({ name, param });
                    return this;
                },
                put: async (param?: Object): Promise<Dbms> => {
                    const data = _.isEmpty(param) ? await this.putData({ name }) : await this.putData({ name, param });
                    return this;
                },
                delete: async (param?: Object): Promise<Dbms> => {
                    const data = _.isEmpty(param)
                        ? await this.deleteData({ name })
                        : await this.deleteData({ name, param });
                    return this;
                },
                update: async (param?: Object): Promise<Dbms> => {
                    const data = _.isEmpty(param)
                        ? await this.updateData({ name })
                        : await this.updateData({ name, param });
                    return this;
                }
            };
        }

        private async getData(config: Object): Promise<Object> {
            return {};
        }

        private async putData(config: Object): Promise<boolean> {
            return true;
        }

        private async deleteData(config: Object): Promise<boolean> {
            return true;
        }

        private async updateData(config: Object): Promise<boolean> {
            return true;
        }
    }
}

export default Database;
