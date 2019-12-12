import { Mongoose } from "mongoose";
import { collectionOperations } from "../../Utils/Types";
import { Dbms, ResponseMetadata } from "../../Utils/Interfaces";
declare namespace Database {
    class ManagmentDatabase implements Dbms {
        private dbClient;
        private connect;
        private responseParams;
        constructor(db: string);
        readonly db: string;
        private operations;
        connection(): Promise<void | Mongoose>;
        disconnect(): Promise<null | Mongoose>;
        getConnect(): Mongoose | null;
        getResponseParams(): ResponseMetadata;
        setResponse(config: Object): Dbms;
        setResponseParams(param: Object | string): void;
        clearResponseParams(): Dbms;
        collection(name: string): collectionOperations;
    }
}
export default Database;
