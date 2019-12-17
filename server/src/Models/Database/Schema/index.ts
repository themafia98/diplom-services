import { Schema, model } from "mongoose";
import Security from "../../Security";

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: "Укажите e-mail",
            dropDups: true
        },
        passwordHash: String,
        departament: String,
        displayName: String,
        position: String,
        rules: String,
        accept: Boolean
    },
    { timestamps: true }
);
let passwordHash: null | string = null;
userSchema
    .virtual("password")
    .set(async (password: string) => {
        console.log(password);
        passwordHash = password;
        await Security.globalSecuiriy.hashing(<string>password, 10);
    })
    .get(function(this: typeof userSchema) {
        return <string>passwordHash;
    });

userSchema.methods.checkPassword = function(password: string) {
    if (!password) return;
    if (!this.password) return;

    return Security.globalSecuiriy.verify(<string>password, (<any>this).password);
};

export const task = new Schema({
    key: String,
    status: String,
    name: String,
    priority: String,
    author: String,
    editor: [String],
    description: String,
    date: [String],
    comments: [Object],
    modeAdd: String
});

export const jurnalItem = new Schema({
    key: String,
    id: String,
    timeLost: String,
    editor: [String],
    date: [String],
    description: String,
    modeAdd: String
});

export const newsItem = new Schema({
    entityMap: Object,
    blocks: [Object]
});

export const UserModel = model("users", userSchema);

export const getSchemaByName = (name: string): Schema | null => {
    switch (name) {
        case "task":
            return task;
        case "jurnalItem":
            return jurnalItem;
        case "newsItem":
            return newsItem;
        default:
            return null;
    }
};
