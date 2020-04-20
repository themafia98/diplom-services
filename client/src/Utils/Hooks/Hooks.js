import _ from 'lodash';
import { clientDB } from '../../Models/ClientSideDatabase';
import { getStoreSchema } from '../utilsHook';
import { runLocalUpdateAction, runBadNetworkAction, runRefreshIndexedDb, runNoCorsAction } from './utils';

/** Hooks */
const errorHook = (error, dispatch, dep = {}) => {
  const { errorRequstAction } = dep;
  if (error.status === 400 || error?.message?.toLowerCase().includes('network error')) {
    runBadNetworkAction(dispatch, error, dep);
  } else dispatch(errorRequstAction(error.message));
};

const onlineDataHook = async (dispatch, dep = {}, multiple = false) => {
  const {
    noCorsClient,
    requestError,
    copyStore,
    sortBy,
    pathValid,
    isPartData,
    schema,
    storeLoad,
    clientDB,
    methodQuery,
    saveComponentStateAction,
    errorRequstAction,
    isLocalUpdate: localUpdateStat,
    indStoreName,
  } = dep;

  let isLocalUpdate = localUpdateStat;

  if (noCorsClient && _.isNull(requestError)) {
    const [isDone, data] = runNoCorsAction(dispatch, dep, multiple);
    if (isDone) return data;
  }

  if (!_.isNull(requestError)) dispatch(errorRequstAction(null));
  const currentStore = indStoreName ? indStoreName : storeLoad;
  const [cursor, eventResult, shouldUpdate] = await runRefreshIndexedDb(
    dispatch,
    currentStore,
    dep,
    multiple,
  );
  isLocalUpdate = shouldUpdate;
  if (cursor) return eventResult;

  if (!isLocalUpdate) {
    const depParser = {
      copyStore,
      isPartData,
      storeLoad,
      methodQuery,
      schema,
      clientDB,
      sortBy,
      pathValid,
      requestError,
    };
    const depAction = {
      saveComponentStateAction,
      errorRequstAction,
    };
    runLocalUpdateAction(dispatch, depAction, depParser, multiple);
  }
};

const cachingHook = async (dispatch, dep = {}, depActions = {}) => {
  const { depStore, depKey, item = {}, store, actionType, clientDB, schema, Request } = dep;
  const { сachingAction, errorRequstAction } = depActions;
  try {
    const path = `/${depStore}/caching/jurnal`;
    const body = { queryParams: { depKey, depStore }, item };
    const rest = new Request();

    const res = await rest.sendRequest(path, 'PUT', body, true);
    const [items, error] = rest.parseResponse(res);
    const { dataItems: updaterItem = null } = items;

    if (error) throw new Error(error);

    const schemTemplate = getStoreSchema(store, null);

    const validHash = [updaterItem].map((it) => schema?.getSchema(schemTemplate, it)).filter(Boolean);

    if (validHash && validHash?.length) {
      clientDB.addItem(store, validHash);
      dispatch(сachingAction({ data: validHash, load: true, primaryKey: actionType }));
    } else throw new Error('Invalid data props');
  } catch (error) {
    console.error(error);
    dispatch(errorRequstAction(error.message));
  }
};

const getterCacheHook = async (dispatch, dep = {}, depActions = {}) => {
  const { depStore, item = {}, type, actionType, uid, Request } = dep;
  const { сachingAction, errorRequstAction } = depActions;
  try {
    const path = `/${depStore}/${type ? type : 'caching'}`;
    const rest = new Request();

    const body = { queryParams: { uid }, item, actionType };

    const res = await rest.sendRequest(path, 'PUT', body, true);
    const [items, error] = rest.parseResponse(res);

    if (error) throw new Error(error);

    if (items && type === 'logger') {
      const actionType = 'get_user_settings_log';

      const path = `/${depStore}/${type ? type : 'caching'}`;
      const rest = new Request();

      const body = { queryParams: { uid }, actionType };

      const res = await rest.sendRequest(path, 'POST', body, true);
      const [items, error] = rest.parseResponse(res);
      const { dataItems: updaterItem = null } = items;

      if (error) throw new Error(error);

      dispatch(сachingAction({ data: updaterItem, load: true, primaryKey: actionType }));
    }
  } catch (error) {
    console.error(error);
    dispatch(errorRequstAction(error.message));
  }
};

/**
 * @param {string} store
 * @param {Array<object>} syncData
 */
const syncData = async (store = '', syncData = []) => {
  const localDataList = await clientDB.getAllItems(store);
  return _.uniqBy([...syncData, ...localDataList], '_id');
};

const namespaceHooks = {
  errorHook,
  onlineDataHook,
  cachingHook,
  getterCacheHook,
  syncData,
};

export default namespaceHooks;
