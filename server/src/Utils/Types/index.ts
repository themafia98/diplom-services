import winston from 'winston';
import { files } from 'dropbox';
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
} from '../Interfaces';
import { DocumentQuery, Document } from 'mongoose';
import { Response } from 'express';
import { Socket } from 'socket.io';

export type Payload = string | object | string | null | Socket;
export type limiter = number | null | undefined;
export type ListFolderResult = files.ListFolderResult | null;
export type FileMetadata = files.FileMetadata | null;
export type DeleteFile = files.DeleteResult;
export type Entity = Document | null;
export type BuilderResponse = Promise<DocumentQuery<any, Document> | object | null>;
export type ResRequest = Promise<Response | void>;
export type Decorator = <Function extends ClassDecorator>(target: object, propKey?: string) => void;
export type FileTransportInstance = winston.transports.FileTransportInstance;
export type docResponse = string | number | object | null | Array<any> | any;
export type ActionData = Promise<Array<Document>> | null | Document | Promise<Document>;
export type DocCompared = Document | Document[];
export type FileEdit = FileMetadata | DeleteFile | ListFolderResult | BinaryType;
export type ParserData = Promise<DocCompared | FileEdit | number | null | object | Blob | string>;
export type ParserResult = DocCompared | FileEdit | null | object | number | string;
export type OptionsUpdate = Record<string, boolean | null>;

export type collectionOperations = {
  get: Function;
  set: Function;
  delete: Function;
  update: Function;
  start: Function;
};

export type SchemaEntity =
  | Task
  | User
  | Jurnal
  | News
  | ChatMessage
  | ChatRoom
  | Logger
  | Notification
  | WikiTree
  | WikiPage;

export type actionGet = {
  collection: string;
  param: Object;
};
export type paramAction = {
  from?: string;
  method?: string;
  updateField?: object | undefined;
  id?: object | undefined;
  metadataSearch?: object;
  body?: object;
  methodQuery?: string;
};
export type schemaConfig = {
  name: string;
  schemaType: string;
};

export type transOptions = {
  service?: string;
  auth: object;
  secure?: boolean;
  host?: string;
  port?: number;
};
