import _ from 'lodash';
import { sucessEvent } from '../../Utils';
import { dataParser } from '../../Utils';

/** Utils hooks */

const runBadNetworkMode = (dispatch, error, dep) => {
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
    async (statusRequst) => {
      const state = getState ? getState() : {};
      const { publicReducer: { paramsList = [] } = {}, router = {} } = state;

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
        for await (let requestParams of list) {
          await dispatch(loadCurrentData({ ...requestParams, sync: true }));
        }
      }
    },
    3000,
  );
};

const runNoCorsSave = (dispatch, dep, multiple) => {
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
  const { errorRequestAction, saveComponentStateAction, params = {}, add = false } = depAction;

  const { data, shoudClearError = false, shouldUpdateState = true } = dataParser(true, false, depParser);
  if (shoudClearError) await dispatch(errorRequestAction(null));
  if (shouldUpdateState && !multiple)
    await dispatch(saveComponentStateAction({ ...data, loading: false, add, params }));
  else if (multiple) return data;
};

const coreUtils = { runLocalUpdate, runBadNetworkMode, runRefreshIndexedDb, runNoCorsSave };

export default coreUtils;
