import _ from 'lodash';
import { sucessEvent } from '../';
import { dataParser } from '../';

const namespaceHooks = {
  errorHook: (error, dispatch, dep = {}) => {
    const { Request, setStatus, errorRequstAction, loadCurrentData, getState, storeLoad, path } = dep;
    console.error(error);
    if (error.status === 400 || error?.message?.toLowerCase().includes('Network error')) {
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
  onlineDataHook: async (dispatch, dep = {}) => {
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
        schema,
      };
      const { data } = dataParser(false, false, dep);
      dispatch(saveComponentStateAction(data));
    }

    if (!_.isNull(requestError)) dispatch(errorRequstAction(null));

    if (storeLoad === 'news') {
      await dispatch(
        saveComponentStateAction({
          [storeLoad]: copyStore,
          load: true,
          path: pathValid,
          isPartData,
        }),
      );
    } else {
      const cursor = clientDB.getCursor(storeLoad);
      isLocalUpdate = !_.isNull(cursor);
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
        primaryKey,
        undefiendCopyStore,
        saveComponentStateAction,
        errorRequstAction,
      };

      if (cursor) cursor.onsuccess = sucessEvent.bind(this, dispatch, dep, '');
    }

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
      const { data, shoudClearError = false } = dataParser(true, false, dep);
      if (shoudClearError) await dispatch(errorRequstAction(null));
      await dispatch(saveComponentStateAction(data));
    }
  },
};

export default namespaceHooks;
