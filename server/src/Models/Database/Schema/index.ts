import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { NextFunction } from "connect";

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: "Укажите e-mail",
            dropDups: true
        },
        passwordHash: { type: String, default: "" },
        summary: { type: String, default: "" },
        phone: { type: String, default: "" },
        isOnline: { type: Boolean, default: false },
        departament: String,
        displayName: String,
        position: String,
        rules: String,
        accept: Boolean
    },
    { timestamps: true }
);

userSchema
    .virtual("password")
    .set(async function (password: string): Promise<void> {
        this._plainPassword = password;
        if (password) {
            this.passwordHash = bcrypt.hashSync(<string>password, 10);
            console.log(this.passwordHash);
        } else {
            this.passwordHash = undefined;
        }
    })
    .get(function () {
        return <string>this._plainPassword;
    });

userSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
    if (!password) return false;

    return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.generateJWT = function (): any {
    const today = new Date();
    const expirationDate = new Date(<Date>today);
    expirationDate.setDate(today.getDate() + 30);

    return jwt.sign(
        {
            email: this.email,
            id: this._id,
            exp: expirationDate.getTime() / 1000
        },
        "jwtsecret"
    );
};

userSchema.methods.toAuthJSON = function () {
    return {
        _id: this._id,
        email: this.email,
        position: this.posotion,
        displayName: this.displayName,
        departament: this.departament,
        isOnline: this.isOnline,
        phone: this.phone,
        rules: this.rules,
        accept: this.accept,
        token: this.generateJWT()
    };
};

export const task = new Schema({
    key: {
        type: String,
        dropDups: true
    },
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
    depKey: String,
    timeLost: String,
    editor: String,
    date: [String],
    description: String,
    modeAdd: String
});

export const newsItem = new Schema({
    entityMap: Object,
    blocks: [Object]
});

export const chat = new Schema({
    msg: String,
    authorId: String,
    displayName: String,
    date: String,
    tokenRoom: String,
    groupName: String,
});

export const UserModel = model("users", userSchema);

export const getSchemaByName = (name: string): Schema | null => {
    switch (name) {
        case "task":
            return task;
        case "users":
            return userSchema;
        case "jurnalworks":
            return jurnalItem;
        case "newsItem":
            return newsItem;
        case "chat":
            return chat;
        default:
            return null;
    }
};
