"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const Security_1 = __importDefault(require("../../Security"));
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
    console.log(password);
    this.passwordHash = password;
    this.password = await Security_1.default.globalSecuiriy.hashing(password, 10);
})
    .get(function () {
    return this.passwordHash;
});
userSchema.methods.checkPassword = function (password) {
    if (!password)
        return;
    if (!this.password)
        return;
    return Security_1.default.globalSecuiriy.verify(password, this.password);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvTW9kZWxzL0RhdGFiYXNlL1NjaGVtYS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLHVDQUF5QztBQUN6Qyw4REFBc0M7QUFFdEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxpQkFBTSxDQUN6QjtJQUNJLEtBQUssRUFBRTtRQUNILElBQUksRUFBRSxNQUFNO1FBQ1osUUFBUSxFQUFFLGdCQUFnQjtRQUMxQixRQUFRLEVBQUUsSUFBSTtLQUNqQjtJQUNELFlBQVksRUFBRSxNQUFNO0lBQ3BCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFdBQVcsRUFBRSxNQUFNO0lBQ25CLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLEtBQUssRUFBRSxNQUFNO0lBQ2IsTUFBTSxFQUFFLE9BQU87Q0FDbEIsRUFDRCxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FDdkIsQ0FBQztBQUVGLFVBQVU7S0FDTCxPQUFPLENBQUMsVUFBVSxDQUFDO0tBQ25CLEdBQUcsQ0FBQyxLQUFLLFdBQVUsUUFBZ0I7SUFDaEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN0QixJQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztJQUM3QixJQUFJLENBQUMsUUFBUSxHQUFHLE1BQU0sa0JBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxDQUFTLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNoRixDQUFDLENBQUM7S0FDRCxHQUFHLENBQUM7SUFDRCxPQUFhLElBQUssQ0FBQyxZQUFZLENBQUM7QUFDcEMsQ0FBQyxDQUFDLENBQUM7QUFFUCxVQUFVLENBQUMsT0FBTyxDQUFDLGFBQWEsR0FBRyxVQUFTLFFBQWdCO0lBQ3hELElBQUksQ0FBQyxRQUFRO1FBQUUsT0FBTztJQUN0QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVE7UUFBRSxPQUFPO0lBRTNCLE9BQU8sa0JBQVEsQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFTLFFBQVEsRUFBUSxJQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDbEYsQ0FBQyxDQUFDO0FBRVcsUUFBQSxJQUFJLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQzNCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsTUFBTSxFQUFFLE1BQU07SUFDZCxJQUFJLEVBQUUsTUFBTTtJQUNaLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO0lBQ2hCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNkLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNsQixPQUFPLEVBQUUsTUFBTTtDQUNsQixDQUFDLENBQUM7QUFFVSxRQUFBLFVBQVUsR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDakMsR0FBRyxFQUFFLE1BQU07SUFDWCxFQUFFLEVBQUUsTUFBTTtJQUNWLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNoQixJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDZCxXQUFXLEVBQUUsTUFBTTtJQUNuQixPQUFPLEVBQUUsTUFBTTtDQUNsQixDQUFDLENBQUM7QUFFVSxRQUFBLFFBQVEsR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDL0IsU0FBUyxFQUFFLE1BQU07SUFDakIsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO0NBQ25CLENBQUMsQ0FBQztBQUVVLFFBQUEsU0FBUyxHQUFHLGdCQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRXZDLFFBQUEsZUFBZSxHQUFHLENBQUMsSUFBWSxFQUFpQixFQUFFO0lBQzNELFFBQVEsSUFBSSxFQUFFO1FBQ1YsS0FBSyxNQUFNO1lBQ1AsT0FBTyxZQUFJLENBQUM7UUFDaEIsS0FBSyxZQUFZO1lBQ2IsT0FBTyxrQkFBVSxDQUFDO1FBQ3RCLEtBQUssVUFBVTtZQUNYLE9BQU8sZ0JBQVEsQ0FBQztRQUNwQjtZQUNJLE9BQU8sSUFBSSxDQUFDO0tBQ25CO0FBQ0wsQ0FBQyxDQUFDIn0=