import { getApiUrlByActionPath, makeBody } from './api.utils';

const makeApiAction = (aPath, path, options = null, aType = '') => {
  const URL = getApiUrlByActionPath(aPath);
  const body = makeBody(aPath, path, options, aType);

  return [URL, body, aPath?.split('__??')?.[0]];
};

const getActionStore = (aPath) => {
  return /\{\{(.+)\}\}/.exec(aPath)?.[1] || '';
};

export { makeApiAction, getActionStore };
