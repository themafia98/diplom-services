import moment from 'moment';
import produce from 'immer';
import _ from 'lodash';
import { runNoCorsParser, toSymbol } from './utils';
import { getStoreSchema } from '../utilsHook';
import regExpRegister from 'Utils/Tools/regexpStorage';
import { getActionPathByKey } from 'actions.path';

const dataParser = (dependencies, offlineStore = []) => {
  const {
    copyStore = [],
    storeLoad = '',
    methodQuery = 'get_all',
    schema,
    clientDB,
    sortBy,
    pathValid,
    requestError,
    noCorsClient = false,
    add = false,
  } = dependencies;

  const store = [...copyStore];

  if (offlineStore?.length) {
    offlineStore.forEach((it) => {
      const item = { ...it };
      const { _id = 0, key = '' } = item || {};
      const index = store.findIndex(({ _id: idOffline = 0, key: keyOffline = '' }) => {
        if ([typeof idOffline, typeof _id].every((type) => type === 'string')) {
          return idOffline === _id;
        }

        if (key && keyOffline) return key === keyOffline;

        return false;
      });

      if (index !== -1) store[index] = item;
    });
  }

  if (noCorsClient) {
    return runNoCorsParser(store, sortBy, storeLoad, pathValid);
  }

  let shouldClearError = false;
  const templateSchema = getStoreSchema(storeLoad, methodQuery);

  let storeCopyValid = store.map((it) => schema?.getSchema(templateSchema, it)).filter(Boolean);

  if (clientDB) {
    storeCopyValid.forEach((it) => schema.isPublicKey(it) && clientDB.updateItem(storeLoad, it));
  } else console.warn('No client db connect');

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

  const data = { [storeLoad]: add ? sortedCopyStore?.[0] : sortedCopyStore, load: true, path: pathValid };
  return { data, shouldClearError, shouldUpdateState: Boolean(storeLoad) };
};

const getNormalizedPath = (useStore = false, dep = {}) => {
  const { startPath = '', storeLoad = '', xhrPath = '' } = dep;
  return useStore
    ? `/${startPath}/${storeLoad}/${xhrPath}`.trim().replace('//', '/')
    : `/${startPath}/${xhrPath}`.trim().replace('//', '/');
};

/**
 * @deprecated 06.05.2020
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
 * @deprecated 06.05.2020
 * @param {Blob} img
 * @param {(arg0: string | ArrayBuffer) => void} callback
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

  if (pageType === 'link') {
    const [page = '', moduleId = '', entityKey = ''] = route.split(regExpRegister.MODULE_KEY);
    return { page, itemId: entityKey, moduleId, path: route };
  } else if (pageType === 'page') {
    const [page = '', pageChild = ''] = route.split(regExpRegister.MODULE_ID);
    return { page, pageChild, path: route };
  } else if (pageType === 'moduleItem') {
    const arrayDataRoute = route.split(regExpRegister.MODULE_ID);

    if (arrayDataRoute.length < 2 || arrayDataRoute.length > 3) return route;

    const page = arrayDataRoute[0];
    const itemId = arrayDataRoute[1];

    return { page, itemId, path: `${page}__${itemId}` };
  } else if (pageType === 'module') {
    const arrayDataRoute = route.split(regExpRegister.MODULE_SUB);

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
  if (!page && !moduleId && !key) {
    return null;
  }

  if (pathType === 'module' || pathType === 'link') {
    if (!page) {
      return '';
    }

    let path = page;

    if (moduleId && pathType !== 'link') {
      path = `${page}_${moduleId}`;
    } else if (pathType === 'link') {
      path = moduleId ? `${page}_${moduleId}__${key}` : `${page}__${key}`;
    }

    return {
      path,
      moduleId,
      key: pathType === 'link' ? key : '',
      page: page,
    };
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

  const actionTypes = _.uniq(metadata.map(({ action: { type = '' } = {} }) => type));
  const actionsList = [];

  actionTypes.forEach((actionType) => {
    const action = metadata.filter(({ action: { type = '' } = {} }) => type === actionType);
    actionsList.push([...action]);
  });

  if (!actionTypes.length) return actionTypes;

  return actionsList.reduce((actionsList, actionsArray) => {
    if (!Array.isArray(actionsArray)) return null;
    const item = actionsArray[0] || {};
    const { action = null } = item || {};
    if (!action) return actionsList;
    const { type = '', moduleName: path = '', link = '', method = '' } = action;
    const storeLoad = typeof type === 'string' ? type.split('_')[0] : '';
    const methodRequest = method ? method : link ? 'POST' : 'GET';

    const actionPath = getActionPathByKey([methodRequest, storeLoad, type?.includes('link') ? 'list' : type]);

    return [
      ...actionsList,
      {
        action: actionPath,
        path: `${path}${prefix}`,
        prefix,
        options: {
          keys: _.uniq(actionsArray.map((notification) => notification?.action?.link)),
        },
      },
    ];
  }, []);
};

const getValidContent = (contentStateProp) => {
  const contentState = contentStateProp ? contentStateProp : {};
  /** Validation for drawer lib */

  const validContentState = {
    ...contentState,
  };

  if (!contentState?.blocks || (contentState?.blocks && _.isEmpty(contentState.blocks)))
    validContentState.blocks = [
      {
        key: '637gr',
        text: '',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
    ];
  if (!contentState?.entityMap) validContentState.entityMap = {};
  return validContentState;
};

/**
 * @param {string} store
 * @param {Array<object>} syncData
 */
const syncData = async (store = '', syncData = [], clientDB = null) => {
  if (!clientDB) {
    console.error('Error sync data, client db connect');
    return [];
  }
  const localDataList = await clientDB.getAllItems(store);
  return _.uniqBy([...syncData, ...localDataList], '_id');
};

const getDataSource = (dataSource = [], filterBy = '', fid = '') => {
  if (!filterBy) return dataSource;

  if (typeof filterBy === 'string')
    return dataSource.filter((it) => Array.isArray(it[filterBy]) && it[filterBy].some((id) => id === fid));

  return dataSource.filter((it) => {
    return filterBy.some((filter) => {
      if (typeof it[filter] !== 'string' && !Array.isArray(it[filter])) {
        return false;
      }

      if (typeof it[filter] === 'string') return it[filter] === fid;
      else return it[filter].some((id) => id === fid);
    });
  });
};

const validationItems = (currentItems, prevItems, id = '_id') => {
  return [...new Map([...currentItems, ...prevItems].map((it) => [it[id], it])).values()];
};

const isTimeLostValue = (value) => {
  return regExpRegister.TIME_JURNAL_STRING.test(value);
};

/**
 * @param {string} tabKey
 * @returns {string[]} [moduleName, subModuleName, entityKey]
 */
const parseModuleKey = (tabKey) => {
  const parsedModuleKeys = tabKey.split(regExpRegister.MODULE_KEY);
  const [moduleName = '', subModuleName = '', entityKey = ''] = parsedModuleKeys;
  if (subModuleName === '$link$') return [moduleName, '', entityKey];
  return parsedModuleKeys;
};

const moduleIdGenerator = (moduleName, entityId = '') => {
  return entityId ? `${moduleName}__$$${entityId}$$` : moduleName;
};

/**
 *
 * @param {string} moduleName
 * @param {string} subModuleName
 * @param {string} entityKey
 * @returns {string} one of type module:
 *                   $entrypoint_module |
 *                   $sub_entrypoint_module |
 *                   $entity_entrypoint | l
 *                   $link_entrypoint
 */
const getModuleTypeByParsedKey = (moduleName, subModuleName, entityKey) => {
  if (!moduleName) return null;

  const isVirtualEntrypoint = entityKey && regExpRegister.VIRTUAL_MODULE.test(subModuleName);

  if ((!subModuleName && !entityKey) || isVirtualEntrypoint) return toSymbol('$entrypoint_module');
  else if (subModuleName && !entityKey) return toSymbol('$sub_entrypoint_module');
  else if (subModuleName && entityKey) return toSymbol('$entity_entrypoint');
  else if (!subModuleName && entityKey) return toSymbol('$link_entrypoint');
  return null;
};

/**
 *
 * @param {any[]} array unsorting array
 * @param {string} key key for sorting
 * @param {string} type type sorting element (def: string)
 * @param {any} customParamsForSort custom params for specific type sorting, for example,
 *                                  date type is format: 'DD.MM.YYY'. (expandable as needed)
 * @param {number} index if sorting element is array, choose element for sorting from array(def: 0)
 */
const sortedByKey = (array, key, type = 'string', customParamsForSort, index = 0) => {
  if (!Array.isArray(array) || !key) return array;

  return array.sort((a, b) => {
    if ([a, b].every((element) => !element || typeof element !== 'object') || !a[key] || !b[key]) {
      return a - b;
    }

    const sortElementA = Array.isArray(a[key]) ? a[key][index] : a[key];
    const sortElementB = Array.isArray(b[key]) ? b[key][index] : b[key];

    if (type === 'date' && customParamsForSort) {
      return (
        moment(sortElementB, customParamsForSort).unix() - moment(sortElementA, customParamsForSort).unix()
      );
    }

    return sortElementA - sortElementB;
  });
};

/**
 *
 * @param {any[]} array
 * @param {{ listLimit: number, visibleItemIndex: number }} configuration
 */
const parseArrayByLimit = (array = [], configuration = {}) => {
  const { listLimit = Number.MAX_SAFE_INTEGER, visibleItemIndex = 0 } = configuration;

  if (!array?.length || array?.length < listLimit) return array;
  return array.slice(visibleItemIndex, visibleItemIndex + listLimit);
};

const saveAndNormalizeRoute = (router, config) => {
  const normalizeRouter = produce(router, (draftRoute) => {
    draftRoute.activeTabs = router.activeTabs.filter((tab) =>
      config.menu.find(({ EUID }) => tab.includes(EUID)),
    );

    draftRoute.routeData = {};
    draftRoute.routeDataActive = {};

    if (!draftRoute.activeTabs.includes(draftRoute.currentActionTab)) {
      const prevTabIndex = draftRoute.activeTabs.findIndex((tab) => tab === draftRoute.currentActionTab);

      draftRoute.currentActionTab =
        prevTabIndex > 0 ? router.activeTabs[prevTabIndex - 1] : router.activeTabs[0];
    }
  });

  const currentSaveRouter = localStorage.getItem('router');
  const jsonRouterString = JSON.stringify(normalizeRouter);

  if (currentSaveRouter === jsonRouterString) return;

  localStorage.setItem('router', jsonRouterString);
};

const getAvailableTabNameKey = (DATAKEY, metadata) => {
  const { listdata = {}, title = '', name = '', displayName = '' } = metadata || {};
  const { title: titleListdata = '' } = listdata;
  const isName = DATAKEY && name;

  return isName ? name : title ? title : titleListdata ? titleListdata : displayName ? displayName : DATAKEY;
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
  isTimeLostValue,
  parseModuleKey,
  getModuleTypeByParsedKey,
  sortedByKey,
  parseArrayByLimit,
  moduleIdGenerator,
  saveAndNormalizeRoute,
  getAvailableTabNameKey,
};

export default namespaceParser;
