// @ts-nocheck
import _ from 'lodash';
import Request from '../../Models/Rest';
import { sucessEvent } from '../';
import { dataParser } from '../';

/** Utils hooks */

const runBadNetworkAction = (dispatch, error, dep) => {
  const {
    rest,
    setStatus,
    errorRequestAction,
    loadCurrentData,
    getState,
    path,
    params,
    multipleLoadData,
  } = dep;

  if (!loadCurrentData && !errorRequestAction) return;

  if (!loadCurrentData && errorRequestAction) {
    dispatch(errorRequestAction(error.message));
    if (setStatus) dispatch(setStatus({ statusRequst: 'offline', params, path }));
  }

  if (setStatus) dispatch(setStatus({ statusRequst: 'offline', params, path }));
  else return;
  dispatch(errorRequestAction(error.message));

  rest.follow(
    'offline',
    (statusRequst) => {
      const state = getState ? getState() : {};
      const { publicReducer: { status = '', paramsList = [] } = {}, router = {} } = state;

      if (statusRequst === 'online') {
        const { path, routeData = {} } = router;
        const currentModule = path && routeData[path] ? routeData[path] : {};
        const currnetParams = !currentModule?.params ? {} : currentModule.params;
        rest.unfollow();

        dispatch(setStatus({ statusRequst, clearParams: true }));
        const list = _.uniqBy([...paramsList, currnetParams], 'path');

        if (multipleLoadData) {
          dispatch(multipleLoadData({ requestsParamsList: list, sync: true }));
          return;
        }
        for await (let requestParams of list){
          await dispatch(loadCurrentData({ ...requestParams, sync: true })); 
        }
      }
    },
    3000,
  );
};

const runNoCorsAction = (dispatch, dep, multiple) => {
  const { saveComponentStateAction, params = {} } = dep;
  const { data = {}, shouldUpdateState = true } = dataParser(false, false, dep);

  if (shouldUpdateState && !multiple) {
    dispatch(saveComponentStateAction({ ...data, params }));
    return [true, null];
  }

  return [true, data];
};

const runRefreshIndexedDb = async (dispatch, storeName, dep, multiple) => {
  const { clientDB, isLocalUpdate } = dep;

  let shouldUpdate = isLocalUpdate;
  const cursor = await clientDB.getCursor(storeName, 'readwrite');

  shouldUpdate = !_.isNull(cursor);
  if (cursor) {
    const eventResult = await sucessEvent(dispatch, dep, '', multiple, cursor);
    return [cursor, eventResult, shouldUpdate];
  }
  return [null, null, shouldUpdate];
};

const runLocalUpdateAction = async (dispatch, depAction, depParser, multiple) => {
  const { errorRequestAction, saveComponentStateAction, params = {} } = depAction;

  const { data, shoudClearError = false, shouldUpdateState = true } = dataParser(true, false, depParser);
  if (shoudClearError) await dispatch(errorRequestAction(null));
  if (shouldUpdateState && !multiple)
    await dispatch(saveComponentStateAction({ ...data, loading: false, params }));
  else if (multiple) return data;
};

const runServerSync = async (list = [], rest) => {
  try {
    if (!rest instanceof Request) {
      throw new TypeError('invalid request model entity');
    }
    const { data = {} } = await rest.sendRequest('/system/sync', 'POST', { syncList: list }, true);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const runSync = async (dep = {}) => {
  const { clientDB, rest } = dep || {};
  const range = IDBKeyRange.lowerBound(0);
  const valuesDb = clientDB.availableList;

  if (!valuesDb || !valuesDb?.length) return null;

  const offlineDataList = [];

  for await (let value of valuesDb) {
    const { entity = '' } = value || {};
    if (!entity) continue;

    const items = await clientDB.getAllItems(entity, 'readonly', range);
    const filteredItems = items?.length ? items.filter((item) => item?.offline) : [];

    if (!filteredItems?.length) continue;

    offlineDataList.push({
      entity,
      items: items
        .map((item) => {
          if (item?.offline) {
            return { ...item, offline: false };
          }
          return null;
        })
        .filter(Boolean),
    });
  }

  if (offlineDataList?.length) runServerSync(offlineDataList, rest);
};

export default { runLocalUpdateAction, runBadNetworkAction, runRefreshIndexedDb, runNoCorsAction, runSync };
