import { Params } from '../Utils/Interfaces';

export const createParams = (methodQuery: string, status: string, from: string, done = true): Params => ({
  methodQuery,
  status,
  from,
  done,
});
