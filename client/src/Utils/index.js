import namespaceParser from './Parser';
import namespaceEvents from './Events';
import namespaceHooks from './Hooks';

/**
 * Utils
 * export some utils from namespaces
 */

const { sucessEvent, forceUpdateDetectedInit } = namespaceEvents;
const {
  errorHook,
  coreUpdaterDataHook,
  cachingHook,
  getterCacheHook,
  putterCacheHook,
  updateEntityHook,
} = namespaceHooks;

const {
  dataParser,
  getNormalizedPath,
  b64toBlob,
  getBase64,
  routeParser,
  routePathNormalise,
  buildRequestList,
  getValidContent,
} = namespaceParser;

export {
  dataParser,
  getNormalizedPath,
  sucessEvent,
  forceUpdateDetectedInit,
  b64toBlob,
  getBase64,
  routeParser,
  routePathNormalise,
  errorHook,
  coreUpdaterDataHook,
  buildRequestList,
  getValidContent,
  cachingHook,
  getterCacheHook,
  putterCacheHook,
  updateEntityHook,
};
