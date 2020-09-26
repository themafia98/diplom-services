import namespaceParser from './Parser';
import namespaceEvents from './Events';
import namespaceHooks from './Hooks';
import namespaceTools from './Tools';

/**
 * Utils
 * export some utils from namespaces
 */

const { sucessEvent, forceUpdateDetectedInit, showSystemMessage } = namespaceEvents;
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
  parseModuleKey,
  getModuleTypeByParsedKey,
  sortedByKey,
  parseArrayByLimit,
  saveAndNormalizeRoute,
} = namespaceParser;

const {
  createNotification,
  createEntity,
  deleteFile,
  loadFile,
  findData,
  getComponentByKey,
  getDependencyModules,
  oneOfType,
  getValidRouteData,
  findUser,
} = namespaceTools;

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
  findData,
  parseModuleKey,
  getModuleTypeByParsedKey,
  getDependencyModules,
  oneOfType,
  sortedByKey,
  parseArrayByLimit,
  getValidRouteData,
  saveAndNormalizeRoute,
  findUser,
  showSystemMessage,
};
