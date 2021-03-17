import { APP_STATUS } from 'App.constant';
import _ from 'lodash';
import { sucessEvent } from '../../Utils';
import { dataParser } from '../../Utils';

/** Utils hooks */

const runBadNetworkMode = (dispatch, error, dep) => {
  const {
    rest,
    setAppStatus,
    setRequestError,
    loadCurrentData,
    getState,
    path,
    params,
    multipleLoadData,
  } = dep;

  if (!loadCurrentData && !setRequestError) return;

  if (!loadCurrentData && setRequestError) {
    dispatch(setRequestError(error.message));
    if (setAppStatus) dispatch(setAppStatus({ statusRequst: APP_STATUS.OFF, params, path }));
  }

  if (setAppStatus) dispatch(setAppStatus({ statusRequst: APP_STATUS.OFF, params, path }));
  else return;
  dispatch(setRequestError(error.message));

  rest.follow(
    APP_STATUS.OFF,
    async (statusRequst) => {
      const state = getState ? getState() : {};
      const { publicReducer: { paramsList = [] } = {}, router = {} } = state;

      if (statusRequst === APP_STATUS.ON) {
        const { path, routeData = {} } = router;
        const currentModule = path && routeData[path] ? routeData[path] : {};
        const currnetParams = !currentModule?.params ? {} : currentModule.params;
        rest.unfollow();

        dispatch(setAppStatus({ statusRequst, clearParams: true }));
        const list = _.uniqBy([...paramsList, currnetParams], 'path');

        if (multipleLoadData) {
          dispatch(multipleLoadData({ requestsParamsList: list, sync: true }));
          return;
        }
        for await (let requestParams of list) {
          await dispatch(loadCurrentData({ ...requestParams, sync: true }));
        }
      }
    },
    3000,
  );
};

const runNoCorsSave = (dispatch, dep, multiple) => {
  const { refreshRouterData, params = {} } = dep;
  const { data = {}, shouldUpdateState = true } = dataParser(false, false, dep);

  if (shouldUpdateState && !multiple) {
    dispatch(refreshRouterData({ ...data, params }));
    return [true, null];
  }

  return [true, data];
};

const runRefreshIndexedDb = async (dispatch, storeName, dep, multiple) => {
  const { clientDB, isLocalUpdate } = dep;
  if (!clientDB) {
    console.error('error runRefresh client db');
    return [];
  }
  let shouldUpdate = isLocalUpdate;
  const cursor = await clientDB.getCursor(storeName, 'readwrite');

  shouldUpdate = cursor !== null;
  if (cursor) {
    const eventResult = await sucessEvent(dispatch, dep, '', multiple, cursor);
    return [cursor, eventResult, shouldUpdate];
  }
  return [null, null, shouldUpdate];
};

const runLocalUpdate = async (dispatch, depAction, depParser, multiple) => {
  const { setRequestError, refreshRouterData, params = {}, add = false } = depAction;

  const { data, shoudClearError = false, shouldUpdateState = true } = dataParser(true, false, depParser);
  if (shoudClearError) await dispatch(setRequestError(null));
  if (shouldUpdateState && !multiple)
    await dispatch(refreshRouterData({ ...data, loading: false, add, params }));
  else if (multiple) return data;
};

const coreUtils = { runLocalUpdate, runBadNetworkMode, runRefreshIndexedDb, runNoCorsSave };

export default coreUtils;
