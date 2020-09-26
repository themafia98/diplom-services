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

const getApiUrlByActionPath = (aPath = '', method = 'POST', options = null) => {
  if (typeof aPath !== 'string') return '';

  const urlMatchResult = /\?\?(.+)\?\?/.exec(aPath);
  const url = urlMatchResult?.[1]?.replace('.', '/');
  let parsedApiUrl = url?.[0] !== '/' ? `/${url}` : url;

  if (method === 'GET' && options) {
    Object.keys(options).forEach((optionKey) => {
      const char = parsedApiUrl.charAt(parsedApiUrl.length - 1);

      if (char !== '?' && char !== '&') {
        parsedApiUrl += `?${optionKey}=${options[optionKey]}&`;
        return;
      }

      parsedApiUrl += `${optionKey}=${options[optionKey]}&`;
    });

    if (parsedApiUrl.charAt(parsedApiUrl.length - 1) === '&') {
      parsedApiUrl = parsedApiUrl.slice(0, -1);
    }
  }

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
