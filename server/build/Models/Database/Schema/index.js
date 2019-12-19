"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const userSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
userSchema
    .virtual("password")
    .set(async function (password) {
    this._plainPassword = password;
    console.log("password:", password);
    if (password) {
        this.passwordHash = await bcrypt_1.default.hashSync(password, 10);
    }
    else {
        this.passwordHash = undefined;
    }
})
    .get(function () {
    return this._plainPassword;
});
userSchema.methods.checkPassword = async function (password) {
    console.log(password);
    if (!password)
        return false;
    return await bcrypt_1.default.compareSync(password, this.passwordHash);
};
userSchema.methods.generateJWT = function () {
    const today = new Date();
    const expirationDate = new Date(today);
    expirationDate.setDate(today.getDate() + 60);
    return jsonwebtoken_1.default.sign({
        email: this.email,
        id: this._id,
        exp: expirationDate.getTime() / 1000,
    }, 'jwtsecret');
};
userSchema.methods.toAuthJSON = function () {
    return {
        _id: this._id,
        email: this.email,
        position: this.posotion,
        departament: this.departament,
        rules: this.rules,
        accept: this.accept,
        token: this.generateJWT(),
    };
};
exports.task = new mongoose_1.Schema({
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
exports.jurnalItem = new mongoose_1.Schema({
    key: String,
    id: String,
    timeLost: String,
    editor: [String],
    date: [String],
    description: String,
    modeAdd: String
});
exports.newsItem = new mongoose_1.Schema({
    entityMap: Object,
    blocks: [Object]
});
exports.UserModel = mongoose_1.model("users", userSchema);
exports.getSchemaByName = (name) => {
    switch (name) {
        case "task":
            return exports.task;
        case "jurnalItem":
            return exports.jurnalItem;
        case "newsItem":
            return exports.newsItem;
        default:
            return null;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvTW9kZWxzL0RhdGFiYXNlL1NjaGVtYS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVDQUF5QztBQUN6QyxnRUFBK0I7QUFDL0Isb0RBQTRCO0FBRTVCLE1BQU0sVUFBVSxHQUFHLElBQUksaUJBQU0sQ0FDekI7SUFDSSxLQUFLLEVBQUU7UUFDSCxJQUFJLEVBQUUsTUFBTTtRQUNaLFFBQVEsRUFBRSxnQkFBZ0I7UUFDMUIsUUFBUSxFQUFFLElBQUk7S0FDakI7SUFDRCxZQUFZLEVBQUUsTUFBTTtJQUNwQixXQUFXLEVBQUUsTUFBTTtJQUNuQixXQUFXLEVBQUUsTUFBTTtJQUNuQixRQUFRLEVBQUUsTUFBTTtJQUNoQixLQUFLLEVBQUUsTUFBTTtJQUNiLE1BQU0sRUFBRSxPQUFPO0NBQ2xCLEVBQ0QsRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQ3ZCLENBQUM7QUFFRixVQUFVO0tBQ0wsT0FBTyxDQUFDLFVBQVUsQ0FBQztLQUNuQixHQUFHLENBQUMsS0FBSyxXQUFVLFFBQWdCO0lBRS9CLElBQUksQ0FBQyxjQUFjLEdBQUcsUUFBUSxDQUFDO0lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLElBQUksUUFBUSxFQUFFO1FBQ1osSUFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLGdCQUFNLENBQUMsUUFBUSxDQUFTLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNqRTtTQUFNO1FBQ2IsSUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7S0FDL0I7QUFDQyxDQUFDLENBQUM7S0FDRCxHQUFHLENBQUM7SUFDRCxPQUFZLElBQUksQ0FBQyxjQUFjLENBQUM7QUFDcEMsQ0FBQyxDQUFDLENBQUM7QUFFUCxVQUFVLENBQUMsT0FBTyxDQUFDLGFBQWEsR0FBRyxLQUFLLFdBQVUsUUFB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