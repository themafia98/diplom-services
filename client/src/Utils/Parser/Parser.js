// @ts-nocheck
import moment from 'moment';
import _ from 'lodash';
import { clientDB } from '../../Models/ClientSideDatabase';
import { runNoCorsParser } from './utils';
import { getStoreSchema } from '../utilsHook';

const dataParser = (flag = false, isLocalUpdate = true, dep = {}) => {
  const {
    copyStore = [],
    isPartData = false,
    storeLoad = '',
    methodQuery,
    schema,
    clientDB,
    sortBy,
    pathValid,
    requestError,
    noCorsClient = false,
  } = dep;

  if (noCorsClient) {
    return runNoCorsParser(copyStore, sortBy, storeLoad, pathValid, isPartData);
  }

  let shouldClearError = false;
  const templateSchema = getStoreSchema(storeLoad, methodQuery);

  let storeCopyValid = copyStore.map((it) => schema?.getSchema(templateSchema, it)).filter(Boolean);
  storeCopyValid.forEach((it) => schema.isPublicKey(it) && clientDB.updateItem(storeLoad, it));

  if (requestError !== null) shouldClearError = true;

  const sortedCopyStore =
    !sortBy && storeCopyValid.every((it) => it.createdAt)
      ? storeCopyValid.sort((a, b) => {
          const aDate = moment(a.createdAt).unix();
          const bDate = moment(b.createdAt).unix();
          return bDate - aDate;
        })
      : sortBy
      ? storeCopyValid.sort((a, b) => a[sortBy] - b[sortBy])
      : storeCopyValid;

  const data = { [storeLoad]: sortedCopyStore, load: true, path: pathValid, isPartData };
  return { data, shouldClearError, shouldUpdateState: Boolean(storeLoad) };
};

const getNormalizedPath = (useStore = false, dep = {}) => {
  const { startPath = '', storeLoad = '', xhrPath = '' } = dep;
  return useStore
    ? `/${startPath}/${storeLoad}/${xhrPath}`.trim().replace('//', '/')
    : `/${startPath}/${xhrPath}`.trim().replace('//', '/');
};

/**
 * @param {string} b64Data
 * @param contentType
 * @param sliceSize
 */
const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

/**
 * @param {Blob} img
 * @param {(arg0: string | ArrayBuffer) => any} callback
 */
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
};

/**
 * @return {string | object} route path string
 *  @param {string | object} pageType string
 *  @param {string | null} path string or null
 */
const routeParser = ({ pageType = 'module', path: route = null }) => {
  if (typeof route !== 'string') return '';

  if (pageType === 'page') {
    const arrayDataRoute = route.split(/__/gi);
    const page = arrayDataRoute[0];
    const pageChild = arrayDataRoute[1] ? arrayDataRoute[1] : null;
    return { page, pageChild, path: route };
  } else if (pageType === 'moduleItem') {
    const arrayDataRoute = route.split(/__/gi);

    if (arrayDataRoute.length < 2 || arrayDataRoute.length > 3) return route;

    const page = arrayDataRoute[0];
    const itemId = arrayDataRoute[1];

    return { page, itemId, path: `${page}__${itemId}` };
  } else if (pageType === 'module') {
    const arrayDataRoute = route.split(/_/gi);

    if (arrayDataRoute.length < 2 || arrayDataRoute.length > 3) return route;

    const page = arrayDataRoute[0];
    const moduleId = arrayDataRoute[1];

    return { page, moduleId, path: `${page}_${moduleId}` };
  } else return route;
};
/**
 *  @return {object} object with normalize path
 *  @param {string} pathType string
 *  @param {object} pathData Object
 *  @param {string} page string (pathData)
 *  @param {string} moduleId string (pathData)
 *  @param {string} key string (pathData)
 */
const routePathNormalise = ({
  pathType = 'module',
  pathData: { page = '', moduleId = '', key = '' } = {},
}) => {
  if (!page && !moduleId && !key) return '';
  if (typeof page !== 'string' || typeof moduleId !== 'string' || typeof key !== 'string') return '';
  if (pathType === 'module') {
    if (!page) return '';
    return { path: moduleId ? `${page}_${moduleId}` : page, moduleId: moduleId, page: page };
  } else if (pathType === 'moduleItem') {
    if (!key) return '';
    return {
      path: moduleId ? `${page}_${moduleId}__${key}` : `${page}__${key}`,
      page,
      moduleId,
      key,
    };
  }
};
const buildRequestList = (metadata = [], prefix = '') => {
  if (!metadata || (metadata && !metadata.length)) return metadata;

  const actionTypes = _.uniq(metadata.map(({ action: { type = '' } }) => type));
  const actionsList = [];

  actionTypes.forEach((actionType) => {
    const action = metadata.filter(({ action: { type = '' } }) => type === actionType);
    actionsList.push([...action]);
  });

  if (!actionTypes.length) return actionTypes;

  return actionsList
    .map((actionsArray) => {
      if (!Array.isArray(actionsArray)) return null;
      const item = actionsArray[0] || {};
      const { action = null } = item || {};
      if (!action) return null;
      const { type = '', moduleName: path = '', link = '', method = '' } = action;
      const storeLoad = _.isString(type) ? type.split('_')[0] : '';
      const methodRequest = method ? method : link ? 'POST' : 'GET';
      return {
        path: `${path}${prefix}`,
        storeLoad,
        methodRequest,
        useStore: Boolean(storeLoad),
        options: {
          keys: _.uniq(actionsArray.map((notification) => notification?.action?.link)),
        },
      };
    })
    .filter(Boolean);
};

const getValidContent = (contentState) => {
  /** Validation for drawer lib */
  if (!contentState) return null;

  const validContentState = {
    ...contentState,
  };

  if (!contentState?.blocks) validContentState.blocks = [];
  if (!contentState?.entityMap) validContentState.entityMap = {};
  return validContentState;
};

/**
 * @param {string} store
 * @param {Array<object>} syncData
 */
const syncData = async (store = '', syncData = []) => {
  const localDataList = await clientDB.getAllItems(store);
  return _.uniqBy([...syncData, ...localDataList], '_id');
};

const getDataSource = (dataSource = [], filterBy = '', fid = '') => {
  if (!filterBy) return dataSource;

  if (_.isString(filterBy))
    return dataSource.filter((it) => _.isArray(it[filterBy]) && it[filterBy].some((id) => id === fid));

  return dataSource.filter((it) => {
    return filterBy.some((filter) => {
      if (!_.isString(it[filter]) && !_.isArray(it[filter])) {
        return false;
      }

      if (_.isString(it[filter])) return it[filter] === fid;
      else return it[filter].some((id) => id === fid);
    });
  });
};

const validationItems = (currentItems, prevItems, id = '_id') => {
  return [...new Map([...currentItems, ...prevItems].map((it) => [it[id], it])).values()];
};

const namespaceParser = {
  dataParser,
  getNormalizedPath,
  b64toBlob,
  getBase64,
  routeParser,
  routePathNormalise,
  buildRequestList,
  getValidContent,
  syncData,
  getDataSource,
  validationItems,
};

export default namespaceParser;
