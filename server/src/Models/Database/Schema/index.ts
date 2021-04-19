import { Schema, model, Model, Document, Types } from 'mongoose';
import { User, Task } from '../../../Utils/Interfaces/Interfaces.global';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { ROLES } from '../../AccessRole/AcessRole.constant';
import authConfig from '../../../config/auth.config';
import { ENTITY } from './Schema.constant';

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
  // eslint-disable-next-line func-names
  .set(async function (this: User, password: string): Promise<void> {
    // eslint-disable-next-line no-underscore-dangle
    this._plainPassword = password;
    if (password) {
      this.passwordHash = bcrypt.hashSync(password, 10);
      console.log(this.passwordHash);
    } else {
      this.passwordHash = undefined;
    }
  })
  // eslint-disable-next-line func-names
  .get(function () {
    // eslint-disable-next-line no-underscore-dangle
    return this._plainPassword;
  });

// eslint-disable-next-line func-names
userSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
  if (!password) return false;

  const result = await bcrypt.compare(password, this.passwordHash as string);
  return result;
};

// eslint-disable-next-line func-names
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

// eslint-disable-next-line func-names
userSchema.methods.generateJWT = function (): any {
  if (!authConfig.SECRET) {
    throw new Error('invalid jwt secret');
  }
  return jwt.sign(
    {
      iss: this.email,
      // eslint-disable-next-line no-underscore-dangle
      sub: this._id,
      iat: new Date().getTime(),
      exp: new Date().setHours(new Date().getHours() + 8),
    },
    authConfig.SECRET,
  );
};

// eslint-disable-next-line func-names
userSchema.methods.toAuthJSON = function () {
  return {
    // eslint-disable-next-line no-underscore-dangle
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
    depKey: { type: Types.ObjectId, ref: ENTITY.TASK, required: true },
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
      // eslint-disable-next-line
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
          ref: ENTITY.USERS,
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
    treeId: { type: Types.ObjectId, ref: ENTITY.WIKI_TREE, required: true },
    lastEditName: { type: String, required: true },
    lastEditDate: { type: String, required: true },
    content: {
      // eslint-disable-next-line
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

export const recoveryToken = new Schema({
  userId: { type: Types.ObjectId, ref: ENTITY.USERS, required: true },
  expire_at: { type: Date, default: Date.now, expires: 1600 },
});

export const UserModel: Model<Document> = model(ENTITY.USERS, userSchema);

export const getSchemaByName = (name: string) => {
  switch (name) {
    case ENTITY.TASK:
      return task;
    case ENTITY.USERS:
      return userSchema;
    case ENTITY.TASK_LOGS:
      return jurnalItem;
    case ENTITY.NEWS:
      return news;
    case ENTITY.CHAT_MESSAGE:
      return chatMsg;
    case ENTITY.CHAT_ROOM:
      return chatRoom;
    case ENTITY.SETTINGS_LOGS:
      return logger;
    case ENTITY.SETTINGS:
      return settings;
    case ENTITY.NOTIFICATION:
      return notification;
    case ENTITY.WIKI_TREE:
      return wikiTree;
    case ENTITY.WIKI_PAGE:
      return wikiPage;
    case ENTITY.RECOVERY_TOKEN:
      return recoveryToken;
    default:
      return null;
  }
};
