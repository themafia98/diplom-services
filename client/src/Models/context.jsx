import { createContext } from 'react';
import config from 'config.json';
import Request from 'Models/Rest';
import Schema from 'Models/Schema';
import { clientDB } from './ClientSideDatabase';
import TreeBuilder from './TreeBuilder';

export const modelMethods = {
  TreeBuilder,
  Schema,
  Request,
  clientDB,
  config,
  rest: new Request(),
  schema: new Schema('no-strict'),
};

const ModelContext = createContext(modelMethods);

export default ModelContext;
