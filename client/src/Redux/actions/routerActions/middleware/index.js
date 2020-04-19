import { getNormalizedPath, sucessEvent, errorHook, onlineDataHook } from '../../../../Utils';
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
    indStoreName = '',
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
        const rest = new Request();
        const res = await rest.sendRequest(normalizeReqPath, methodRequst, { methodQuery, options }, true);

        const [items, error] = rest.parseResponse(res);
        const { dataItems: copyStore = [], responseOptions = {} } = items;
        const { isPartData } = responseOptions || {};

        if (error) throw new Error(error);

        const dep = {
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
          isLocalUpdate,
          indStoreName,
        };

        onlineDataHook(dispatch, dep);
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

      const cursor = await clientDB.getAllItems(indStoreName ? indStoreName : storeLoad);
      return await sucessEvent(dispatch, dep, 'offline', false, cursor);
    }
  }
};

const multipleLoadData = params => async (dispatch, getState, { schema, Request, clientDB }) => {
  const { requestsParamsList = [], pipe = true } = params;

  const primaryKey = 'uuid';
  const { requestError, status = 'online' } = getState().publicReducer;

  if (status === 'online') {
    switch (pipe) {
      case false: {
        /** TODO: for future release */
        return;
      }
      default: {
        const responseList = [];
        for await (let requestParam of requestsParamsList) {
          const {
            useStore = false,
            storeLoad = '',
            startPath = '',
            methodRequst = 'POST',
            methodQuery = 'get_all',
            xhrPath = 'list',
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
            const rest = new Request();
            const res = await rest.sendRequest(
              normalizeReqPath,
              methodRequst,
              { methodQuery, options },
              true,
            );

            const [items, error] = rest.parseResponse(res);

            if (error) {
              console.error(error);
              break;
            }

            const { dataItems: copyStore = [], responseOptions = {} } = items;
            const { isPartData } = responseOptions || {};

            if (error) throw new Error(error);

            const dep = {
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
              isLocalUpdate,
            };

            responseList.push({ parsedItems: items, dep });
          } catch (error) {}
        }
        let hookData = [];
        for await (let res of responseList) {
          const { dep } = res;
          const resultHook = await onlineDataHook(dispatch, dep, true);
          if (resultHook) hookData.push(resultHook);
        }

        if (hookData.length) {
          dispatch(saveComponentStateAction({ stateList: [...hookData], multiple: true }));
        }
      }
    }
  }
};

export { loadCurrentData, multipleLoadData };
