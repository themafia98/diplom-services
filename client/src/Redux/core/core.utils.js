import { APP_STATUS } from 'App.constant';
import _ from 'lodash';
import { sucessEvent } from '../../Utils';
import { dataParser } from '../../Utils';

/** Utils hooks */

const runBadNetworkMode = (dispatch, error, dep) => {
  const { rest, setAppStatus, setRequestError, loadCurrentData, path, params, followCallback } = dep;

  if (!loadCurrentData && !setRequestError) return;

  if (!loadCurrentData && setRequestError) {
    dispatch(setRequestError(error.message));
    if (setAppStatus) dispatch(setAppStatus({ statusRequst: APP_STATUS.OFF, params, path }));
  }

  if (setAppStatus) dispatch(setAppStatus({ statusRequst: APP_STATUS.OFF, params, path }));
  else return;
  dispatch(setRequestError(error.message));

  if (followCallback) {
    rest.follow(APP_STATUS.OFF, followCallback);
    return;
  }

  console.error(`followCallback is ${followCallback}`);
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
