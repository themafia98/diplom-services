import Request from 'Models/Rest';
import Schema from 'Models/Schema';
import TreeBuilder from './TreeBuilder';
import { createContext } from 'react';

export const modelMethods = {
  TreeBuilder,
  Schema,
  Request,
  rest: new Request(),
  schema: new Schema('no-strict'),
};

const ModelContext = createContext(modelMethods);

export default ModelContext;
