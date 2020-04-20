import _ from 'lodash';
import { clientDB } from '../../Models/ClientSideDatabase';
import { IDBPDatabase } from 'idb';
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
  syncData,
};

export default namespaceHooks;
