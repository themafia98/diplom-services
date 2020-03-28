import { createContext } from 'react';
import config from '../config.json';
import Request from '../Models/Rest';
import Schema from '../Models/Schema';
import { clientDB } from './ClientSideDatabase';

export const modelMethods = {
  clientDB,
  rest: new Request(),
  Request,
  config,
  schemaModel: Schema,
  schema: new Schema('no-strict'),
};

const modelsContext = createContext(modelMethods);

export default modelsContext;
