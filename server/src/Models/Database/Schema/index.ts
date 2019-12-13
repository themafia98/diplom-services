import { Schema } from 'mongoose';

export const user = new Schema({
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
})

export const jurnalItem = new Schema({
    key: String,
    id: String,
    timeLost: String,
    editor: [String],
    date: [String],
    description: String,
    modeAdd: String
})


export const newsItem = new Schema({
    entityMap: Object,
    blocks: [Object]
});

export const getSchemaByName = (name: string): Schema | null => {
    switch (name) {
        case "task": return task;
        case "jurnalItem": return jurnalItem;
        case "newsItem": return newsItem;
        case "user": return user;
        default: return null;
    }
}