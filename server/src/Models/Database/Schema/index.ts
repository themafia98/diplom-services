import { Schema, model, Model, Document, Types } from 'mongoose';
import { User, Task } from '../../../Utils/Interfaces/Interfaces.global';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ROLES } from '../../AccessRole/AcessRole.constant';
import authConfig from '../../../config/auth.config';

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
    role: { type: String, default: ROLES.GUEST, required: true },
    avatar: { type: String, default: '', required: false },
    isHideEmail: { type: Boolean, default: false },
    isHidePhone: { type: Boolean, default: false },
    access: { type: Array, default: [], required: false },
    lang: { type: String, default: 'en', required: false },
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

  return await bcrypt.compare(password, this.passwordHash as string);
};

userSchema.methods.changePassword = async function (password: string): Promise<string | null> {
  try {
    const passwordHash: string = await bcrypt.hash(password as string, 10);
    if (!passwordHash) throw new Error('Bad password string for change');

    return passwordHash;
  } catch (err) {
    console.error(err);
    return null;
  }
};

userSchema.methods.generateJWT = function (this: User): any {
  return jwt.sign(
    {
      iss: this.email,
      sub: this._id,
      iat: new Date().getTime(),
      exp: new Date().setHours(new Date().getHours() + 8),
    },
    authConfig.SECRET,
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
    avatar: this.avatar,
    isHideEmail: this.isHideEmail,
    isHidePhone: this.isHidePhone,
    lang: this.lang,
    token: this.generateJWT(),
  };
};

export const task: Schema<Task> = new Schema(
  {
    type: { type: String, default: 'default' },
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
    additionalCreaterData: {
      email: String,
      phone: String,
      default: {},
    },
  },
  { timestamps: true },
);

export const jurnalItem = new Schema(
  {
    depKey: { type: Types.ObjectId, ref: 'task', required: true },
    timeLost: { type: String, required: true },
    editor: { type: String, required: true },
    date: { type: [String], required: true },
    description: { type: String, required: true },
    key: { type: String },
    offline: Boolean,
  },
  { timestamps: true },
);

export const logger = new Schema(
  {
    uid: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, required: true },
    depKey: { type: String, required: true } /** name of settings */,
  },
  { timestamps: true },
);

export const news = new Schema(
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

export const chatMsg = new Schema(
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

export const chatRoom = new Schema(
  {
    type: { type: String, required: true },
    moduleName: { type: String, required: true },
    tokenRoom: { type: String, required: true },
    membersIds: {
      type: [
        {
          type: Types.ObjectId,
          ref: 'users',
          required: true,
        },
      ],
      required: true,
    },
    groupName: String,
  },
  { timestamps: true },
);

export const notification = new Schema(
  {
    key: { type: String, required: false },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, require: true },
    action: {
      type: { type: String, required: true },
      link: { type: Types.ObjectId, required: true },
      moduleName: { type: String, required: true },
    },
    uidCreater: { type: String, required: true },
    authorName: { type: String },
  },
  {
    timestamps: true,
  },
);

export const wikiTree = new Schema(
  {
    title: { type: String, required: true },
    level: { type: Number, required: true },
    path: { type: String, reuired: true },
    parentId: { type: Schema.Types.Mixed, required: true, default: 'root' }, // ObjectId | root string
    index: { type: Number, required: true },
    accessGroups: { type: [String], required: true },
    key: { type: String },
  },
  {
    timestamps: true,
  },
);

export const wikiPage = new Schema(
  {
    treeId: { type: Types.ObjectId, ref: 'wikiTree', required: true },
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

export const settings = new Schema(
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

export const getSchemaByName = (name: string) => {
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
