import coreUtils from '../core.utils';
import { getStoreSchema } from '../../../Utils/utilsHook';
import { setRequestError } from 'Redux/reducers/publicReducer.slice';
import { refreshRouteDataItem } from 'Redux/reducers/routerReducer.slice';

const { runLocalUpdate, runRefreshIndexedDb, runNoCorsSave, runBadNetworkMode } = coreUtils;

const coreDataUpdater = (dependencies, multiple = false, badNetwork = false) => async (
  dispatch,
  getState,
  { schema, Request },
) => {
  const {
    noCorsClient,
    requestError,
    copyStore,
    sortBy,
    pathValid,
    storeLoad,
    clientDB,
    methodQuery,
    isLocalUpdate: localUpdateStat,
    params,
    add,
  } = dependencies;

  dependencies.schema = schema;

  let isLocalUpdate = localUpdateStat;

  if (noCorsClient && requestError === null) {
    const [isDone, data] = runNoCorsSave(dispatch, dependencies, multiple);
    if (isDone) return data;
  }

  if (requestError !== null && !badNetwork) {
    dispatch(setRequestError(null));
  }

  const [cursor = null, eventResult = null, shouldUpdate = null] = await runRefreshIndexedDb(
    dispatch,
    storeLoad,
    dependencies,
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
      add,
    };

    try {
      return await runLocalUpdate(dispatch, depAction, depParser, multiple);
    } catch (error) {
      console.error(error);
    }
  }
};

const updateEntityThunk = (dependencies) => async (dispatch, getState, { schema, Request }) => {
  const { parsedRoutePath = null, store, dataItems, id, updateBy = '', clientDB = null } = dependencies;

  dependencies.schema = schema;

  const schemaTemplate = getStoreSchema(store);

  const dataList = Array.isArray(dataItems) && dataItems.length === 1 ? dataItems : [dataItems];
  const storeCopy = dataList.map((it) => schema?.getSchema(schemaTemplate, it)).filter(Boolean);

  if (!storeCopy) return;

  dispatch(
    refreshRouteDataItem({
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

  if (schema?.isPublicKey(dataItems)) {
    await clientDB.updateItem(store, dataItems);
  }
};

const errorThunk = async (error, dependenciesForParseError, loadAction = null) => async (
  dispatch,
  getState,
  { schema, Request },
) => {
  if (error?.message !== 'Network Error') {
    dispatch(setRequestError(error.message));
    return;
  }

  runBadNetworkMode(dispatch, error, dependenciesForParseError, new Request());

  if (typeof loadAction === 'function') {
    dispatch(loadAction());
  }
};

const updater = {
  coreDataUpdater,
  errorThunk,
  updateEntityThunk,
};

export default updater;
