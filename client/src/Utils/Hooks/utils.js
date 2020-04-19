import _ from 'lodash';
import { sucessEvent } from '../';
import { dataParser } from '../';

/** Utils hooks */

const runBadNetworkAction = (dispatch, error, dep) => {
  const { Request, setStatus, path, storeLoad, errorRequstAction, loadCurrentData, getState } = dep;
  const errorRequest = new Request();
  dispatch(setStatus({ statusRequst: 'offline' }));
  dispatch(errorRequstAction(error.message));
  errorRequest.follow(
    'offline',
    statusRequst => {
      if (getState().publicReducer.status !== statusRequst && statusRequst === 'online') {
        errorRequest.unfollow();

        dispatch(setStatus({ statusRequst }));
        dispatch(errorRequstAction(null));
        dispatch(loadCurrentData({ path, storeLoad }));
      }
    },
    3000,
  );
};

const runNoCorsAction = (dispatch, dep, multiple) => {
  const { saveComponentStateAction } = dep;
  const { data, shouldUpdateState = true } = dataParser(false, false, dep);

  if (shouldUpdateState && !multiple) {
    dispatch(saveComponentStateAction(data));
    return [false, null];
  }

  return [true, data];
};

const runRefreshIndexedDb = async (dispatch, storeName, dep, multiple) => {
  const { clientDB, isLocalUpdate } = dep;
  let shouldUpdate = isLocalUpdate;
  const cursor = await clientDB.getCursor(storeName);
  shouldUpdate = !_.isNull(cursor);
  if (cursor) {
    const eventResult = await sucessEvent(dispatch, dep, '', multiple, cursor);
    return [cursor, eventResult, shouldUpdate];
  }
  return [null, null, shouldUpdate];
};

const runLocalUpdateAction = async (dispatch, depAction, depParser, multiple) => {
  const { errorRequstAction, saveComponentStateAction } = depAction;
  const { data, shoudClearError = false, shouldUpdateState = true } = dataParser(true, false, depParser);
  if (shoudClearError) await dispatch(errorRequstAction(null));
  if (shouldUpdateState && !multiple) await dispatch(saveComponentStateAction(data));
  else if (multiple) return data;
};

export { runLocalUpdateAction, runBadNetworkAction, runRefreshIndexedDb, runNoCorsAction };
