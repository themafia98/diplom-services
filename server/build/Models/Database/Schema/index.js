"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
exports.user = new mongoose_1.Schema({
    login: String,
    password: String,
    email: String,
    phone: String,
    name: String,
    lastname: String,
    departament: String,
    position: String,
    uuid: String,
    rules: String,
    accept: Boolean,
});
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
exports.getSchemaByName = (name) => {
    switch (name) {
        case "task": return exports.task;
        case "jurnalItem": return exports.jurnalItem;
        case "newsItem": return exports.newsItem;
        case "user": return exports.user;
        default: return null;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvTW9kZWxzL0RhdGFiYXNlL1NjaGVtYS9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVDQUFrQztBQUVyQixRQUFBLElBQUksR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDM0IsS0FBSyxFQUFFLE1BQU07SUFDYixRQUFRLEVBQUUsTUFBTTtJQUNoQixLQUFLLEVBQUUsTUFBTTtJQUNiLEtBQUssRUFBRSxNQUFNO0lBQ2IsSUFBSSxFQUFFLE1BQU07SUFDWixRQUFRLEVBQUUsTUFBTTtJQUNoQixXQUFXLEVBQUUsTUFBTTtJQUNuQixRQUFRLEVBQUUsTUFBTTtJQUNoQixJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxNQUFNO0lBQ2IsTUFBTSxFQUFFLE9BQU87Q0FDbEIsQ0FBQyxDQUFDO0FBR1UsUUFBQSxJQUFJLEdBQUcsSUFBSSxpQkFBTSxDQUFDO0lBQzNCLEdBQUcsRUFBRSxNQUFNO0lBQ1gsTUFBTSxFQUFFLE1BQU07SUFDZCxJQUFJLEVBQUUsTUFBTTtJQUNaLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE1BQU0sRUFBRSxNQUFNO0lBQ2QsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO0lBQ2hCLFdBQVcsRUFBRSxNQUFNO0lBQ25CLElBQUksRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNkLFFBQVEsRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNsQixPQUFPLEVBQUUsTUFBTTtDQUNsQixDQUFDLENBQUE7QUFFVyxRQUFBLFVBQVUsR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDakMsR0FBRyxFQUFFLE1BQU07SUFDWCxFQUFFLEVBQUUsTUFBTTtJQUNWLFFBQVEsRUFBRSxNQUFNO0lBQ2hCLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQztJQUNoQixJQUFJLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDZCxXQUFXLEVBQUUsTUFBTTtJQUNuQixPQUFPLEVBQUUsTUFBTTtDQUNsQixDQUFDLENBQUE7QUFHVyxRQUFBLFFBQVEsR0FBRyxJQUFJLGlCQUFNLENBQUM7SUFDL0IsU0FBUyxFQUFFLE1BQU07SUFDakIsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDO0NBQ25CLENBQUMsQ0FBQztBQUVVLFFBQUEsZUFBZSxHQUFHLENBQUMsSUFBWSxFQUFpQixFQUFFO0lBQzNELFFBQVEsSUFBSSxFQUFFO1FBQ1YsS0FBSyxNQUFNLENBQUMsQ0FBQyxPQUFPLFlBQUksQ0FBQztRQUN6QixLQUFLLFlBQVksQ0FBQyxDQUFDLE9BQU8sa0JBQVUsQ0FBQztRQUNyQyxLQUFLLFVBQVUsQ0FBQyxDQUFDLE9BQU8sZ0JBQVEsQ0FBQztRQUNqQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLE9BQU8sWUFBSSxDQUFDO1FBQ3pCLE9BQU8sQ0FBQyxDQUFDLE9BQU8sSUFBSSxDQUFDO0tBQ3hCO0FBQ0wsQ0FBQyxDQUFBIn0=