import { Schema, model } from "mongoose";
import bcrypt from 'bcrypt';
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

userSchema
    .virtual("password")
    .set(async function(password: string){
       
         this._plainPassword = password;
         console.log("password:", password);
          if (password) {
           this.passwordHash = bcrypt.hashSync(<string>password, 10);
          } else {
    this.passwordHash = undefined;
  }
    })
    .get(function() {
        return <any>this._plainPassword;
    });

userSchema.methods.checkPassword = function(password: string):boolean {
    if (!password) return false;
    return bcrypt.compareSync(password, this.passwordHash);
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
