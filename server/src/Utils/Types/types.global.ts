import winston from 'winston';
import { files } from 'dropbox';
import { User } from '../Interfaces/Interfaces.global';
import { Document } from 'mongoose';
import { Response } from 'express';
import { Socket } from 'socket.io';
import { BinaryLike } from 'crypto';
import { WriteStream } from 'fs';

export type MenuConfig = { EUID: string; PARENT_CODE: string | null };
export type Role = 'GUEST' | 'SUPER_ADMIN' | 'ADMIN' | 'MEMBER';
export type Payload = string | Record<string, any> | string | null | Socket;
export type limiter = number | null | undefined;
export type ListFolderResult = files.ListFolderResult | null;
export type FileMetadata = files.FileMetadata | null;
export type DeleteFile = files.DeleteResult;
export type Entity = Document | null | string | number;
export type ResRequest = Promise<Response | void | WriteStream | ReadableStream | WritableStream>;
export type Decorator = any;
export type FileTransportInstance = winston.transports.FileTransportInstance;
export type docResponse = string | number | Record<string, any> | null | Array<any>;
export type ActionData = Promise<Array<Document>> | null | Document | Promise<Document>;
export type DocCompared = Document | Document[];
export type FileEdit = FileMetadata | DeleteFile | ListFolderResult | BinaryLike;
export type ParserData = DocCompared | FileEdit | number | null | Record<string, any> | Blob | string | User;
export type ParserResult =
  | DocCompared
  | FileEdit
  | null
  | Record<string, any>
  | number
  | string
  | { result: Document[] };
export type OptionsUpdate = Record<string, boolean | null>;
export type Meta = Record<string, any> | Array<any> | number | string | null;

export type FileBody = {
  buffer: Buffer;
};

export type Pagination = {
  current: number;
  pageSize: number;
};

export type MessageOptions = {
  tokenRoom: string;
  moduleName: string;
  membersIds: Array<string>;
};

export type SocketMeta = {
  socketConnection: boolean;
  module: string;
  tokenRoom?: string;
  uid?: string;
  updateField?: string | Record<string, any>;
};

export type SocketMessage = {
  authorId: string;
  moduleName: string;
  tokenRoom: string;
  groupName: string;
};

export type DeleteEntitiyParams = {
  ids?: Array<string>;
  updateProps?: Record<string, any>;
  returnType?: string;
  updateField?: string;
  uid?: string;
};

export type Filter = {
  $or?: Array<Record<string, any>>;
  $and?: Array<Record<string, any>>;
};

export type methodDecorator = 'get' | 'post' | 'delete' | 'options' | 'put';

export type collectionOperations = {
  get: string;
  set: string;
  delete: string;
  update: string;
  start: string;
};

export type actionGet = {
  collection: string;
  param: Record<string, any>;
};
export type paramAction = {
  from?: string;
  method?: string;
  updateField?: Record<string, any> | undefined;
  id?: Record<string, any> | undefined;
  metadataSearch?: Record<string, any>;
  body?: Record<string, any>;
  methodQuery?: string;
};
export type schemaConfig = {
  name: string;
  schemaType: string;
};

export type transOptions = {
  service?: string;
  auth: Record<string, any>;
  secure?: boolean;
  host?: string;
  port?: number;
};

export type expressFile = Express.Multer.File[] | Express.Multer.File;
