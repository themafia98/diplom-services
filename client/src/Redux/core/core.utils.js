import { APP_STATUS } from 'App.constant';
import _ from 'lodash';
import { setRequestError } from 'Redux/reducers/publicReducer.slice';
import { refreshRouterData } from 'Redux/reducers/routerReducer.slice';
import { sucessEvent } from '../../Utils';
import { dataParser } from '../../Utils';

/** Utils hooks */

const runBadNetworkMode = (dispatch, error, dependencies, rest) => {
  const { followCallback } = dependencies;

  // if (setAppStatus) dispatch(setAppStatus({ statusRequst: APP_STATUS.OFF, params, path }));

  dispatch(setRequestError(error.message));

  if (followCallback && rest) {
    rest.follow(APP_STATUS.OFF, followCallback);
    return;
  }

  console.error(`followCallback is ${followCallback}`);
};

const runNoCorsSave = (dispatch, dependencies, multiple) => {
  const { params } = dependencies;
  const { data = {}, shouldUpdateState = true } = dataParser(dependencies);

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
  const { params = {}, add = false } = depAction;

  const { data, shoudClearError = false, shouldUpdateState = true } = dataParser(depParser);
  if (shoudClearError) await dispatch(setRequestError(null));
  if (shouldUpdateState && !multiple)
    await dispatch(refreshRouterData({ ...data, loading: false, add, params }));
  else if (multiple) return data;
};

const coreUtils = { runLocalUpdate, runBadNetworkMode, runRefreshIndexedDb, runNoCorsSave };

export default coreUtils;
