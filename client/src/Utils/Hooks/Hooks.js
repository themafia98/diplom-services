import _ from 'lodash';
import { sucessEvent } from '../';
import { dataParser } from '../';

const namespaceHooks = {
  errorHook: (error, dispatch, dep = {}) => {
    const { Request, setStatus, errorRequstAction, loadCurrentData, getState, storeLoad, path } = dep;
    console.error(error);
    if (error.status === 400 || error?.message?.toLowerCase().includes('network error')) {
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
    } else dispatch(errorRequstAction(error.message));
  },
  onlineDataHook: async (dispatch, dep = {}, multiple = false) => {
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
      primaryKey,
      saveComponentStateAction,
      errorRequstAction,
      isLocalUpdate: localUpdateStat,
    } = dep;
    const undefiendCopyStore = [];
    let isLocalUpdate = localUpdateStat;

    if (noCorsClient && _.isNull(requestError)) {
      const dep = {
        noCorsClient,
        copyStore,
        sortBy,
        pathValid,
        isPartData,
        storeLoad,
        schema,
      };
      const { data, shouldUpdateState = true } = dataParser(false, false, dep);

      if (shouldUpdateState && !multiple) dispatch(saveComponentStateAction(data));
      else if (multiple) return data;
    }

    if (!_.isNull(requestError)) dispatch(errorRequstAction(null));

    const cursor = await clientDB.getCursor(storeLoad);
    isLocalUpdate = !_.isNull(cursor);

    if (cursor) return await sucessEvent(dispatch, dep, '', multiple, cursor);

    if (!isLocalUpdate) {
      const dep = {
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

      // @ts-ignore
      const { data, shoudClearError = false, shouldUpdateState = true } = dataParser(true, false, dep);
      if (shoudClearError) await dispatch(errorRequstAction(null));
      if (shouldUpdateState && !multiple) await dispatch(saveComponentStateAction(data));
      else if (multiple) return data;
    }
  },
};

export default namespaceHooks;
