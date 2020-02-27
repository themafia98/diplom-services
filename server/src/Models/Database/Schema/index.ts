import { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { NextFunction } from "connect";

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            dropDups: true,
        },
        passwordHash: { type: String, default: "", required: true },
        summary: { type: String, default: "", },
        phone: { type: String, default: "", },
        isOnline: { type: Boolean, default: false, required: true },
        departament: { type: String, required: true },
        displayName: { type: String, required: true },
        position: { type: String, required: true },
        rules: { type: String, default: "guest", required: true },
        accept: { type: Boolean, default: false, required: true }
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
        dropDups: true,
        required: true
    },
    status: { type: String, required: true },
    name: { type: String, required: true },
    priority: { type: String, required: true },
    author: { type: String, required: true },
    editor: { type: [String], required: true },
    description: { type: String, required: true },
    date: { type: [String], required: true },
    comments: { type: [Object], required: true },
    modeAdd: String
});

export const jurnalItem = new Schema({
    depKey: { type: String, required: true },
    timeLost: { type: String, required: true },
    editor: { type: String, required: true },
    date: { type: [String], required: true },
    description: { type: String, required: true },
    modeAdd: String
});

export const news = new Schema({
    entityMap: { type: Object, required: true, default: {} },
    blocks: { type: Array, required: true }
}, {
    timestamps: true
});

export const chatMsg = new Schema({
    msg: { type: String, required: true },
    authorId: { type: String, required: true },
    displayName: { type: String, required: true },
    date: { type: String, required: true },
    tokenRoom: { type: String, required: true },
    groupName: { type: String, required: true },
    moduleName: { type: String, required: true }
});

export const chatRoom = new Schema({
    type: { type: String, required: true },
    moduleName: { type: String, required: true },
    tokenRoom: { type: String, required: true },
    membersIds: { type: [String], required: true },
    groupName: String
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
        case "news":
            return news;
        case "chatMsg":
            return chatMsg;
        case "chatRoom":
            return chatRoom;
        default:
            return null;
    }
};
