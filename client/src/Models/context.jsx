import { createContext } from 'react';
import config from '../config.json';
import Request from '../Models/Rest';
import Schema from '../Models/Schema';
import Notification from '../Models/NotificationRouter';
import { clientDB } from './ClientSideDatabase';

export const modelMethods = {
  clientDB,
  rest: new Request(),
  Request,
  config,
  schemaModel: Schema,
  schema: new Schema('no-strict'),
  Notification,
};

const modelsContext = createContext(modelMethods);

export default modelsContext;
