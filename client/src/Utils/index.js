import namespaceParser from './Parser';
import namespaceEvents from './Events';
import namespaceHooks from './Hooks';
import namespaceTools, { components } from './Tools';

/**
 * Utils
 * export some utils from namespaces
 */

const { getComponentByKey } = components;
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
  getDataSource,
  validationItems,
  isTimeLostValue,
} = namespaceParser;

const { createNotification, createEntity, deleteFile, loadFile } = namespaceTools;

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
  createNotification,
  createEntity,
  deleteFile,
  loadFile,
  getDataSource,
  validationItems,
  isTimeLostValue,
  getComponentByKey,
};
