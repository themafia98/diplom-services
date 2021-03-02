import coreUtils from '../core.utils';
import { getStoreSchema } from '../../../Utils/utilsHook';

const { runLocalUpdate, runRefreshIndexedDb, runNoCorsSave, runBadNetworkMode } = coreUtils;

const coreDataUpdater = async (dispatch, dep = {}, multiple = false, badNetwork = false) => {
  const {
    noCorsClient,
    requestError,
    copyStore,
    sortBy,
    pathValid,
    schema,
    storeLoad,
    clientDB,
    methodQuery,
    saveComponentStateAction,
    errorRequestAction,
    isLocalUpdate: localUpdateStat,
    params,
    add,
  } = dep;

  let isLocalUpdate = localUpdateStat;

  if (noCorsClient && requestError === null) {
    const [isDone, data] = runNoCorsSave(dispatch, dep, multiple);
    if (isDone) return data;
  }

  if (requestError !== null && !badNetwork) dispatch(errorRequestAction(null));

  const [cursor = null, eventResult = null, shouldUpdate = null] = await runRefreshIndexedDb(
    dispatch,
    storeLoad,
    dep,
    multiple,
  );

  isLocalUpdate = shouldUpdate && !badNetwork;
  if (cursor) return eventResult;

  if (!isLocalUpdate) {
    const depParser = {
      copyStore,
      storeLoad,
      methodQuery,
      schema,
      clientDB,
      sortBy,
      pathValid,
      params,
      requestError,
      add,
    };
    const depAction = {
      saveComponentStateAction,
      errorRequestAction,
      add,
    };
    try {
      return await runLocalUpdate(dispatch, depAction, depParser, multiple);
    } catch (error) {
      console.error(error);
    }
  }
};

const updateEntityThunk = async (dispatch, dep = {}) => {
  const {
    parsedRoutePath = null,
    store,
    schema,
    dataItems,
    id,
    updateItemStateAction,
    updateBy = '',
    clientDB = null,
  } = dep;

  const schemaTemplate = getStoreSchema(store);

  const dataList = Array.isArray(dataItems) && dataItems.length === 1 ? dataItems : [dataItems];
  const storeCopy = dataList.map((it) => schema?.getSchema(schemaTemplate, it)).filter(Boolean);

  if (!storeCopy) return;

  dispatch(
    updateItemStateAction({
      updaterItem: dataItems,
      type: 'UPDATE',
      updateBy,
      parsedRoutePath,
      store,
      id,
    }),
  );

  if (!clientDB) {
    console.warn('No client db connect');
    return;
  }

  if (schema?.isPublicKey(dataItems)) await clientDB.updateItem(store, dataItems);
};

const errorThunk = async (error, dispatch, dep = {}, callback) => {
  const { errorRequestAction } = dep;

  if (error?.message === 'Network Error') {
    runBadNetworkMode(dispatch, error, dep);
    if (typeof callback === 'function') dispatch(callback());
  } else dispatch(errorRequestAction(error.message));
};

export default {
  coreDataUpdater,
  errorThunk,
  updateEntityThunk,
};
