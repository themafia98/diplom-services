// @ts-nocheck
import _ from 'lodash';
import { clientDB } from '../../../Models/ClientSideDatabase';
import utilsHooks from '../utils';
import { getStoreSchema } from '../../utilsHook';

const { runLocalUpdateAction, runRefreshIndexedDb, runNoCorsAction, runBadNetworkAction } = utilsHooks;

const coreUpdaterDataHook = async (dispatch, dep = {}, multiple = false) => {
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

const updateEntityHook = async (dispatch, dep = {}) => {
  const { store, schema, dataItems, id, updateItemStateAction, updateBy = '' } = dep;

  const schemTemplate = getStoreSchema(store);

  const dataList = Array.isArray(dataItems) ? dataItems : [dataItems];
  const storeCopy = dataList.map((it) => schema?.getSchema(schemTemplate, it)).filter(Boolean);

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

const errorHook = (error, dispatch, dep = {}) => {
  const { errorRequstAction } = dep;
  if (error.status === 400 || error?.message?.toLowerCase().includes('network error')) {
    runBadNetworkAction(dispatch, error, dep);
  } else dispatch(errorRequstAction(error.message));
};

export default {
  coreUpdaterDataHook,
  errorHook,
  updateEntityHook,
};
