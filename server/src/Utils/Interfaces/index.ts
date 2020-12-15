import { Application, Router as RouteExpress, Request as RequestExpress, Response } from 'express';

import nodemailer, { SendMailOptions, Transporter, SentMessageInfo } from 'nodemailer';
import { files } from 'dropbox';
import {
  transOptions,
  ParserData,
  ParserResult,
  Meta,
  limiter,
  OptionsUpdate,
  MenuConfig,
  Role,
  SocketMeta,
  SocketMessage,
  expressFile,
} from '../Types';
import socketio from 'socket.io';
import mongoose, { Connection, Model, Document, FilterQuery } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ParsedUrlQuery } from 'querystring';
export interface Controller<T> {
  [key: string]: any;
}

export interface ActionsAccess {
  EDIT: Readonly<string>;
  VIEW: Readonly<string>;
  LIMITED_VIEW: Readonly<string>;
  READ_VIEW: Readonly<string>;
  CREATE: Readonly<string>;
  DELETE: Readonly<string>;
}

export interface JsonConfig {
  menu: MenuConfig[];
}

export interface QueryParams {
  actionType?: string;
  // mail params
  mailBody?: string;
  themeMail?: string;
  to?: string;
  // other
  uid?: string | ObjectId;
  // chat params
  fakeMsg?: Record<string, string | object>;
  interlocutorId?: string | ObjectId;
  // settings
  items?: object[];
  query?: string;
  // tasks
  keys?: string | Array<string | number>;
  statsListFields?: Array<string>;
  // files
  entityId?: string;
  file?: Record<string, string>;
  // users
  oldPassword?: string;
  newPassword?: string;
  isHidePhone?: boolean | null;
  isHideEmail?: boolean | null;
  newEmail?: string;
  newPhone?: string;
  // some requests
  queryType?: 'many';
  actionParam?: object;
  pageId?: string;
}

export interface AccessConfig {
  name: string;
  access: boolean;
  actions: Array<void | string>;
}

export interface UserRole {
  menu: Readonly<Array<MenuConfig>>;
}

export interface ServerRun {
  session: object;
  smtp: object;
  start(callback?: Function): void;
}

export interface WorkerDataProps {
  action: string;
  payload: any;
}

export interface Mail {
  getMailer(): typeof nodemailer;
  getTransporter(): Transporter | null;
  getSender(): SendMailOptions;
  getMailerConfig(): transOptions;
  create(): Promise<Transporter | null>;
  send(to: string, subject: string, text: string): Promise<SentMessageInfo>;
}

export interface Rest {
  getApp(): Application;
  getRest(): Application;
  setRest(route: Application): void;
  setApp(express: Application): void;
}

export interface Route {
  init: boolean;
  getRest(): Application;
  getEntrypoint(): Application;
  initInstance(path: string): Application;
  createRoute(path: string, flag?: string): RouteExpress;
}

export interface Dbms {
  db: string;
  getStatus(): number;
  getConnectionString(): string;
  disconnect(): Promise<void>;
  connection(): Promise<Connection | typeof mongoose>;
}

export interface SocketMessageDoc extends Document {
  authorId: string;
  moduleName: string;
  tokenRoom: string;
  groupName: string;
}

export interface CryptoSecurity {
  getMode(): string;
  hashing(password: string, salt: number, callback: Function): Promise<void>;
  verify(password: string, hash: Record<string, any>, callback: Function): Promise<void>;
}

export interface App extends Application {
  locals: {
    dbm: Dbms;
    dropbox?: FileApi;
    mailer?: Mail;
  };
  hash: CryptoSecurity;
}

export interface Params {
  methodQuery: string;
  status: string;
  from: string;
  done?: boolean;
  isPartData?: boolean;
  customErrorMessage?: string;
}

export interface ResponseMetadata<T> {
  param: Params;
  body: T;
}

export interface Request extends RequestExpress {
  start?: Date;
  body: BodyLogin;
  session: any;
  isAuthenticated(): boolean;
}

export interface BodyLogin {
  [key: string]: string | number | object | ActionParams;
}

export interface RouteDefinition {
  path: string;
  requestMethod: 'get' | 'post' | 'delete' | 'options' | 'put';
  methodName: string;
  private?: boolean;
  file?: boolean | undefined;
  ws?: boolean | undefined;
}

export interface DecoratorConfig extends Object {
  path: string;
  private: boolean;
  file?: boolean | undefined;
  ws?: boolean | undefined;
}

export interface methodParam extends Object {
  metadata: Array<any>;
}

export interface Metadata extends Object {
  /** Mongo db data object */
  GET: methodParam;
}

export interface MetadataMongo extends Metadata {
  _doc?: Array<object>;
  [key: string]: MetadataMongo | any;
}

export interface ActionParams {
  [key: string]: Meta | boolean | SocketMeta | SocketMessage | expressFile;
}

export interface ResponseDocument {
  [key: string]: number | string | Date | object;
}

export interface MetadataConfig {
  methodQuery: string;
  body?: object;
}

export interface DropboxAccess {
  token: string;
}

export interface ServiceManager<T> {
  getService(): T;
  changeService(service: T): void;
}

export interface User extends Document {
  _id: ObjectId;
  email: string;
  summary: string;
  phone: string;
  isOnline: boolean;
  avatar: string;
  isHideEmail: boolean;
  isHidePhone: boolean;
  passwordHash?: string;
  displayName: string;
  departament: string;
  position: string;
  rules: string;
  accept: boolean;
  token?: string;
  role: Role;
  _plainPassword?: string;
  checkPassword: Function;
  changePassword: Function;
  generateJWT: Function;
  toAuthJSON: Function;
}

export interface TaskEntity {
  type: string;
  key: string;
  status: string;
  name: string;
  priority: string;
  authorName: string;
  uidCreater: string;
  editor: Array<string>;
  description: string;
  date: Array<string>;
  comments: Array<object>;
  offline: boolean;
  tags?: object;
  additionalCreaterData?: object;
}

export interface Task extends Document {
  key: string;
  status: string;
  name: string;
  priority: string;
  authorName: string;
  uidCreater: string;
  editor: Array<string>;
  description: string;
  date: Array<string>;
  comments: Array<object>;
  offline: boolean;
  tags?: object;
}

export interface Jurnal {
  depKey: string;
  timeLost: string;
  editor: string;
  date: Array<string>;
  description: string;
  offline: boolean;
  methodObj: object;
}

export interface Logger {
  uid: string;
  message: string;
  date: string;
  depKey: string;
}

export interface News {
  title: string;
  content: {
    entityMap: object;
    blocks: Array<any>;
  };
}

export interface Settings {
  idSettings: string;
  settings: Array<Object>;
}

export interface ChatMessage {
  msg: string;
  authorId: string;
  displayName: string;
  date: string;
  tokenRoom: string;
  groupName: string;
  moduleName: string;
}

export interface ChatRoom {
  type: string;
  moduleName: string;
  tokenRoom: string;
  membersIds: Array<string>;
  groupName: string;
}

export interface Notification {
  key: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  action: {
    type: string;
    link: string;
    moduleName: string;
  };
  uidCreater: string;
  authorName: string;
}

export interface WikiTree {
  title: string;
  level: number;
  path: string;
  parentId: string;
  index: number;
  accessGroups: Array<string>;
}

export interface WikiPage {
  treeId: string;
  lastEditName: string;
  lastEditDate: string;
  content: {
    entityMap: object;
    blocks: Array<any>;
  };
}

export interface FileApi {
  getAllFiles(): Promise<files.ListFolderResult | null>;
  downloadFileByProps<Props>(fileProps: Props): Promise<files.FileMetadata | null>;
  downloadFile(path: string): Promise<files.GetTemporaryLinkResult | null>;
  saveFile<Props>(saveProps: Props): Promise<files.FileMetadata | null>;
  getFilesByPath(path: string): Promise<files.ListFolderResult | null>;
  deleteFile(path: string): Promise<files.DeleteResult | null>;
}

export interface ActionProps {
  actionPath: Readonly<string>;
  actionType: Readonly<string>;
  body?: Readonly<object>;
  store?: Readonly<FileApi>;
}

export interface DownloadDropbox {
  moduleName: Readonly<string>;
  filename: Readonly<string>;
  ext: Readonly<string>;
  cardName?: Readonly<string>;
}

export interface UploadDropbox {
  path: string;
  contents: Buffer;
}

export interface EntityActionApi {
  getActionPath(): string;
  getActionType(): string;
  getStore(): FileApi;
  getDbm(): Dbms;
}

export interface Action {
  getEntity(): Actions;
  run(actionParam: ActionParams | Meta): Promise<ParserData>;
}

export interface Actions extends EntityActionApi {
  getCounter(model: Model<Document>, query: FilterQuery<any>, options?: object): Promise<number>;
  getAll(
    model: Model<Document>,
    actionParam: ActionParams | QueryParams,
    limit?: limiter,
    skip?: number,
    sortType?: string,
  ): Promise<ParserData>;
  getFilterData(model: Model<Document>, filter: object, sort?: string): Promise<ParserData>;
  createEntity(model: Model<Document>, item: object): Promise<ParserData>;
  deleteEntity(model: Model<Document>, query: ActionParams): Promise<ParserData>;
  updateEntity(
    model: Model<Document>,
    query: ActionParams | QueryParams,
    options?: OptionsUpdate,
  ): Promise<ParserData>;
  findOnce(model: Model<Document>, actionParam: ActionParams): Promise<ParserData>;
  actionsRunner(
    this: Actions,
    actionParam: ActionParams,
    mode?: string,
    queryString?: ParsedUrlQuery,
  ): Promise<Function>;
  runSyncClient(actionParam: ActionParams): Promise<ParserData>;
}

export interface TicketRemote {
  name: string;
  lastName: string;
  address: string;
  phone: string;
  email: string;
  cause: string;
  date: Array<string>;
  other?: string;
}

export interface ResponseJson<T> {
  status: string;
  params: T;
  done: boolean;
  isPartData?: boolean;
  metadata: Readonly<Meta>;
}

export interface WsWorker {
  startSocketConnection(io: socketio.Server): void;
  getWorkerId(): number;
  getWorker(id: number): socketio.Server;
  getWorkersArray(): Array<socketio.Server>;
}

export interface ResponseBuilder {
  res: Response;
  req: Request;
  err: Error | null;
  status: number;
  metadata: ParserResult;
  emit(): Promise<Response>;
}

export interface Access {
  userId: string;

  access: Array<object>;
}
