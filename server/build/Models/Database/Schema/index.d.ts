import { Schema } from "mongoose";
export declare const task: Schema<any>;
export declare const jurnalItem: Schema<any>;
export declare const newsItem: Schema<any>;
export declare const UserModel: import("mongoose").Model<import("mongoose").Document, {}>;
export declare const getSchemaByName: (name: string) => Schema<any>;
