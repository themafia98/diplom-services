import { getApiUrlByActionPath, makeBody } from './api.utils';

const makeApiAction = (aPath, path, options = null, aType = '') => {
  const method = aPath?.split('__??')?.[0];
  const URL = getApiUrlByActionPath(aPath, method, options);
  const body = makeBody(aPath, path, options, aType);

  return [URL, body, method];
};

const getActionStore = (aPath) => {
  return /\{\{(.+)\}\}/.exec(aPath)?.[1] || '';
};

export { makeApiAction, getActionStore };
