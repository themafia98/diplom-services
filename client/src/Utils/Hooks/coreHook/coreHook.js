// @ts-nocheck
import _ from 'lodash';
import { clientDB } from '../../../Models/ClientSideDatabase';
import utilsHooks from '../utils';
import { getStoreSchema } from '../../utilsHook';

const {
  runLocalUpdateAction,
  runRefreshIndexedDb,
  runNoCorsAction,
  runBadNetworkAction,
  runSync,
} = utilsHooks;

const coreUpdaterDataHook = async (dispatch, dep = {}, multiple = false, badNetwork = false) => {
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
    errorRequestAction,
    isLocalUpdate: localUpdateStat,
    indStoreName,
    params,
    sync = false,
  } = dep;

  let isLocalUpdate = localUpdateStat;

  if (sync) runSync(dep);

  if (noCorsClient && _.isNull(requestError)) {
    const [isDone, data] = runNoCorsAction(dispatch, dep, multiple);
    if (isDone) return data;
  }

  if (!_.isNull(requestError) && !badNetwork) dispatch(errorRequestAction(null));
  const currentStore = indStoreName ? indStoreName : storeLoad;
  const [cursor, eventResult, shouldUpdate] = await runRefreshIndexedDb(
    dispatch,
    currentStore,
    dep,
    multiple,
  );

  isLocalUpdate = shouldUpdate && !badNetwork;
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
      params,
      requestError,
    };
    const depAction = {
      saveComponentStateAction,
      errorRequestAction,
    };
    try {
      return await runLocalUpdateAction(dispatch, depAction, depParser, multiple);
    } catch (error) {
      console.error(error);
    }
  }
};

const updateEntityHook = async (dispatch, dep = {}) => {
  const { store, schema, dataItems, id, updateItemStateAction, updateBy = '' } = dep;

  const schemaTemplate = getStoreSchema(store);

  const dataList = Array.isArray(dataItems) ? dataItems : [dataItems];
  const storeCopy = dataList.map((it) => schema?.getSchema(schemaTemplate, it)).filter(Boolean);

  if (!storeCopy) return;

  dispatch(
    updateItemStateAction({
      updaterItem: dataItems,
      type: 'UPDATE',
      updateBy,
      store,
      id,
    }),
  );

  if (schema?.isPublicKey(dataItems)) await clientDB.updateItem(store, dataItems);
};

const errorHook = async (error, dispatch, dep = {}, callback) => {
  const { errorRequestAction } = dep;

  if (error?.message === 'Network Error') {
    await runBadNetworkAction(dispatch, error, dep);
    if (_.isFunction(callback)) dispatch(callback());
  } else dispatch(errorRequestAction(error.message));
};

export default {
  coreUpdaterDataHook,
  errorHook,
  updateEntityHook,
};
