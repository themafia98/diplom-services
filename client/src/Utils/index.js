import namespaceParser from './Parser';
import namespaceEvents from './Events';
import namespaceTools from './Tools';

/**
 * Utils
 * export some utils from namespaces
 */

const { sucessEvent, forceUpdateDetectedInit, showSystemMessage } = namespaceEvents;

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
  getAvailableTabNameKey,
} = namespaceParser;

const {
  createNotification,
  createEntity,
  findData,
  getComponentByKey,
  getDependencyModules,
  oneOfType,
  getValidRouteData,
  findUser,
  checkPageAvailable,
  isToken,
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
  buildRequestList,
  getValidContent,
  createNotification,
  createEntity,
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
  getAvailableTabNameKey,
  checkPageAvailable,
  isToken,
};
