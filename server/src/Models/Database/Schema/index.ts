import { Schema, model, Model, Document } from 'mongoose';
import { SchemaEntity } from '../../../Utils/Types';
import {
  User,
  Task,
  Jurnal,
  Logger,
  News,
  ChatMessage,
  ChatRoom,
  Notification,
  WikiTree,
  WikiPage,
  Settings,
} from '../../../Utils/Interfaces';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema: Schema<User> = new Schema(
  {
    email: {
      type: String,
      required: true,
      dropDups: true,
    },
    passwordHash: { type: String, default: '', required: true },
    summary: { type: String, default: '' },
    phone: { type: String, default: '' },
    isOnline: { type: Boolean, default: false, required: true },
    departament: { type: String, required: true },
    displayName: { type: String, required: true },
    position: { type: String, required: true },
    rules: { type: String, default: 'guest', required: true },
    accept: { type: Boolean, default: false, required: true },
    avatar: { type: String, default: '', required: false },
    isHideEmail: { type: Boolean, default: false },
    isHidePhone: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema
  .virtual('password')
  .set(async function (this: User, password: string): Promise<void> {
    this._plainPassword = password;
    if (password) {
      this.passwordHash = bcrypt.hashSync(password, 10);
      console.log(this.passwordHash);
    } else {
      this.passwordHash = undefined;
    }
  })
  .get(function (this: User) {
    return this._plainPassword;
  });

userSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
  if (!password) return false;

  return await bcrypt.compare(password, <string>this.passwordHash);
};

userSchema.methods.changePassword = async function (password: string): Promise<string | null> {
  try {
    const passwordHash: string = bcrypt.hashSync(<string>password, 10);

    if (!passwordHash) throw new Error('Bad password string for change');

    return passwordHash;
  } catch (err) {
    console.error(err);
    return null;
  }
};

userSchema.methods.generateJWT = function (this: User): any {
  const today = new Date();
  const expirationDate = new Date(<Date>today);
  expirationDate.setDate(today.getDate() + 30);

  return jwt.sign(
    {
      email: this.email,
      id: this._id,
      exp: expirationDate.getTime() / 1000,
    },
    'jwtsecret',
  );
};

userSchema.methods.toAuthJSON = function (this: User) {
  return {
    _id: this._id,
    email: this.email,
    summary: this.summary,
    position: this.position,
    displayName: this.displayName,
    departament: this.departament,
    isOnline: this.isOnline,
    phone: this.phone,
    rules: this.rules,
    accept: this.accept,
    avatar: this.avatar,
    isHideEmail: this.isHideEmail,
    isHidePhone: this.isHidePhone,
    token: this.generateJWT(),
  };
};

export const task: Schema<Task> = new Schema(
  {
    key: {
      type: String,
      dropDups: true,
      required: true,
    },
    status: { type: String, required: true },
    name: { type: String, required: true },
    priority: { type: String, required: true },
    authorName: { type: String, required: true },
    uidCreater: { type: String, required: true },
    editor: { type: [String], required: true },
    description: { type: String, required: true },
    date: { type: [String], required: true },
    comments: { type: [Object], required: true },
    offline: Boolean,
    tags: [
      {
        color: { type: String, required: true },
        id: { type: String, required: true },
        sortable: { type: Boolean, default: false },
        tagValue: { type: String, required: true },
      },
    ],
  },
  { timestamps: true },
);

export const jurnalItem: Schema<Jurnal> = new Schema(
  {
    depKey: { type: String, required: true },
    timeLost: { type: String, required: true },
    editor: { type: String, required: true },
    date: { type: [String], required: true },
    description: { type: String, required: true },
    key: { type: String },
    offline: Boolean,
  },
  { timestamps: true },
);

export const logger: Schema<Logger> = new Schema(
  {
    uid: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, required: true },
    depKey: { type: String, required: true },
  },
  { timestamps: true },
);

export const news: Schema<News> = new Schema(
  {
    title: { type: String, required: true },
    content: {
      entityMap: { type: Object, required: true, default: {} },
      blocks: { type: Array, required: true },
    },
    key: { type: String },
    offline: Boolean,
  },
  { timestamps: true },
);

export const chatMsg: Schema<ChatMessage> = new Schema(
  {
    msg: { type: String, required: true },
    authorId: { type: String, required: true },
    displayName: { type: String, required: true },
    date: { type: String, required: true },
    tokenRoom: { type: String, required: true },
    groupName: { type: String, required: true },
    moduleName: { type: String, required: true },
  },
  { timestamps: true },
);

export const chatRoom: Schema<ChatRoom> = new Schema(
  {
    type: { type: String, required: true },
    moduleName: { type: String, required: true },
    tokenRoom: { type: String, required: true },
    membersIds: { type: [String], required: true },
    groupName: String,
  },
  { timestamps: true },
);

export const notification: Schema<Notification> = new Schema(
  {
    key: { type: String, required: false },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, require: true },
    action: {
      type: { type: String, required: true },
      link: { type: String, required: true },
      moduleName: { type: String, required: true },
    },
    uidCreater: { type: String, required: true },
    authorName: { type: String },
  },
  {
    timestamps: true,
  },
);

export const wikiTree: Schema<WikiTree> = new Schema(
  {
    title: { type: String, required: true },
    level: { type: Number, required: true },
    path: { type: String, reuired: true },
    parentId: { type: String, required: true },
    index: { type: Number, required: true },
    accessGroups: { type: [String], required: true },
    key: { type: String },
  },
  {
    timestamps: true,
  },
);

export const wikiPage: Schema<WikiPage> = new Schema(
  {
    treeId: { type: String, required: true },
    lastEditName: { type: String, required: true },
    lastEditDate: { type: String, required: true },
    content: {
      entityMap: { type: Object, required: true, default: {} },
      blocks: { type: Array, required: true, default: [] },
    },
    key: { type: String },
  },
  { timestamps: true },
);

export const settings: Schema<Settings> = new Schema(
  {
    idSettings: { type: String, required: true, dropDups: true },
    settings: {
      type: [
        {
          id: { type: String, dropDups: true },
          value: { type: Schema.Types.Mixed, dropDups: true },
          active: { type: Boolean, default: false },
        },
      ],
      required: true,
    },
    key: { type: String },
    depKey: { type: String, required: false },
  },
  { timestamps: true },
);

export const UserModel: Model<Document> = model('users', userSchema);

export const getSchemaByName = (name: string): Schema<SchemaEntity> | null => {
  switch (name) {
    case 'task':
      return task;
    case 'users':
      return userSchema;
    case 'jurnalworks':
      return jurnalItem;
    case 'news':
      return news;
    case 'chatMsg':
      return chatMsg;
    case 'chatRoom':
      return chatRoom;
    case 'settingsLog':
      return logger;
    case 'settings':
      return settings;
    case 'notification':
      return notification;
    case 'wikiTree':
      return wikiTree;
    case 'wikiPage':
      return wikiPage;
    default:
      return null;
  }
};
