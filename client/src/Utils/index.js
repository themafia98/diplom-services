import namespaceParser from './Parser';
import namespaceEvents from './Events';
import namespaceHooks from './Hooks';

/**
 * Utils
 * export some utils from namespaces
 */

const { sucessEvent, forceUpdateDetectedInit } = namespaceEvents;
const { errorHook, onlineDataHook } = namespaceHooks;

const {
  dataParser,
  getNormalizedPath,
  b64toBlob,
  getBase64,
  routeParser,
  routePathNormalise,
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
  onlineDataHook,
};
