import _ from 'lodash';
import moment from 'moment';
import { dataParser, getNormalizedPath, sucessEvent, errorHook } from '../../../../Utils';
import { saveComponentStateAction, loadFlagAction } from '../';
import { errorRequstAction, setStatus } from '../../publicActions';

const loadCurrentData = params => async (dispatch, getState, { schema, Request, clientDB }) => {
  const {
    path = '',
    startPath = '',
    storeLoad = '',
    useStore = false,
    methodRequst = 'POST',
    methodQuery = 'get_all',
    xhrPath = 'list',
    noCorsClient = false,
    sortBy = '',
    options = {},
  } = params;

  let isLocalUpdate = true;
  const primaryKey = 'uuid';
  const pathValid = path.includes('_') ? path.split('_')[0] : path.split('__')[0];
  const router = getState().router;

  const { requestError, status = 'online' } = getState().publicReducer;
  const isExist = router.routeData && router.routeData[pathValid];

  if (isExist && !router.routeData[pathValid].load) {
    dispatch(loadFlagAction({ path: pathValid, load: true }));
  }

  switch (status) {
    case 'online': {
      const normalizeReqPath = getNormalizedPath(useStore, {
        xhrPath,
        startPath,
        storeLoad,
      });

      try {
        const request = new Request();
        const res = await request.sendRequest(normalizeReqPath, methodRequst, { methodQuery, options }, true);

        const {
          data: { response = {} },
        } = res || {};

        const { metadata = [], params: { isPartData = false, fromCache = false } = {} } = response;

        let items = [];

        metadata.forEach((doc, index) => _.isNumber(index) && items.push(doc));

        if (items.length) items = items.filter(it => !_.isEmpty(it));
        else if (fromCache && !items.length) throw new Error('Network error');

        const copyStore = [...items];
        const undefiendCopyStore = [];

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
          const data = { [storeLoad]: copyStore, load: true, path: pathValid, isPartData };
          await dispatch(saveComponentStateAction(data));
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
      } catch (error) {
        const dep = {
          Request,
          setStatus,
          errorRequstAction,
          loadCurrentData,
          getState,
          storeLoad,
          path,
        };
        errorHook(error, dispatch, dep);
      }
      return;
    }

    default: {
      if (!noCorsClient) return;

      const dep = {
        storeLoad,
        methodQuery,
        schema,
        clientDB,
        sortBy,
        pathValid,
        requestError,
        primaryKey,
        saveComponentStateAction,
        errorRequstAction,
      };
      const items = clientDB.getAllItems(storeLoad);
      items.onsuccess = sucessEvent.bind(this, dispatch, dep, 'offline');
      return;
    }
  }
};

/** ------------------------ */
/** TODO: in coming soon... */

const onMultipleLoadData = params => async (dispatch, getState, { schema, Request, clientDB }) => {
  const { requestsParamsList = [] } = params;

  const router = getState().router;
  const primaryKey = 'uuid';
  const { requestError, status = 'online' } = getState().publicReducer;
  const responseList = [];

  if (status === 'online') {
    for await (let requestParam of requestsParamsList) {
      const {
        useStore = false,
        storeLoad = '',
        startPath = '',
        xhrPath = '',
        methodRequst = 'POST',
        methodQuery = 'get_all',
        options = {},
        noCorsClient = false,
        sortBy = '',
        path = '',
      } = requestParam;
      let isLocalUpdate = true;
      const pathValid = path.includes('_') ? path.split('_')[0] : path.split('__')[0];

      const normalizeReqPath = getNormalizedPath(useStore, {
        xhrPath,
        startPath,
        storeLoad,
      });

      try {
        const request = new Request();
        const res = await request.sendRequest(normalizeReqPath, methodRequst, { methodQuery, options }, true);

        const {
          data: { response: { metadata = [], params: { isPartData = false, fromCache = false } = {} } = {} },
        } = res || {};

        let items = [];

        metadata.forEach((doc, index) => _.isNumber(index) && items.push(doc));

        if (items.length) items = items.filter(it => !_.isEmpty(it));
        else if (fromCache && !items.length) throw new Error('Network error');

        const copyStore = [...items];
        const undefiendCopyStore = [];
      } catch (error) {}
    }
  }
};

export { loadCurrentData, onMultipleLoadData };
