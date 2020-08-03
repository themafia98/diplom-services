const requestTemplate = {
  actionType: null,
  moduleName: null,
  params: null,
};

const paramsTemplate = {
  path: null,
  options: null,
  query: null,
};

const getApiUrlByActionPath = (aPath = '') => {
  if (typeof aPath !== 'string') return '';

  const urlMatchResult = /\?\?(.+)\?\?/.exec(aPath);
  const url = urlMatchResult?.[1]?.replace('.', '/');
  const parsedApiUrl = url?.[0] !== '/' ? `/${url}` : url;

  return parsedApiUrl || '';
};

const makeBody = (aPath, path, options = null, actionType = '') => {
  const [, action = ''] = aPath.split('$$');
  const [query] = action.split(/\./gi);

  const entrypoint = {
    ...requestTemplate,
    actionType,
    moduleName: path.split('_')[0],
  };

  const params = {
    ...paramsTemplate,
    path,
    query,
    options,
  };

  return {
    ...entrypoint,
    params,
  };
};

export { requestTemplate, paramsTemplate, getApiUrlByActionPath, makeBody };
