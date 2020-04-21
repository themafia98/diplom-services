import _ from 'lodash';
import { sucessEvent } from '../';
import { dataParser } from '../';

/** Utils hooks */

const runBadNetworkAction = (dispatch, error, dep) => {
  const { Request, setStatus, errorRequstAction, loadCurrentData, getState } = dep;
  const errorRequest = new Request();
  dispatch(setStatus({ statusRequst: 'offline' }));
  dispatch(errorRequstAction(error.message));
  errorRequest.follow(
    'offline',
    (statusRequst) => {
      const state = getState();
      const { publicReducer: { status = '' } = {}, router = {} } = state;
      if (status !== statusRequst && statusRequst === 'online') {
        const { path, routeData = {} } = router;
        const currentModule = path && routeData[path] ? routeData[path] : {};
        const requestParams = !currentModule?.params ? {} : currentModule.params;
        errorRequest.unfollow();

        dispatch(setStatus({ statusRequst }));

        dispatch(loadCurrentData({ ...requestParams }));
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
  const { errorRequstAction, saveComponentStateAction, params = {} } = depAction;
  const { data, shoudClearError = false, shouldUpdateState = true } = dataParser(true, false, depParser);
  if (shoudClearError) await dispatch(errorRequstAction(null));
  if (shouldUpdateState && !multiple) await dispatch(saveComponentStateAction({ ...data, params }));
  else if (multiple) return data;
};

export default { runLocalUpdateAction, runBadNetworkAction, runRefreshIndexedDb, runNoCorsAction };
