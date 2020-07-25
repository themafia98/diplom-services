import { getNormalizedPath, sucessEvent, errorHook, coreUpdaterDataHook } from 'Utils';
import { saveComponentStateAction, loadFlagAction } from '../';
import { errorRequestAction, setStatus } from '../../publicActions';
import actionsTypes from 'actions.types';
import regExpRegister from 'Utils/Tools/regexpStorage';
//import workerInstanse from 'workerInstanse';

const loadCurrentData = (params) => async (dispatch, getState, { schema, Request }) => {
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
    shouldSetLoading = false,
    indStoreName = '',
    sync = false,
    clientDB = null,
  } = params;

  let isLocalUpdate = true;
  const primaryKey = 'uuid';
  const pathValid = path.includes('_') ? path : path.split(regExpRegister.MODULE_ID)[0];
  const router = getState().router;

  const { requestError, status = 'online' } = getState().publicReducer;
  const isExist = router.routeData && router.routeData[pathValid];

  if (isExist && !router.routeData[pathValid].load) {
    dispatch(loadFlagAction({ path: pathValid, load: true, loading: true }));
  } else if (pathValid && shouldSetLoading) {
    dispatch(loadFlagAction({ path: pathValid, loading: true }));
  }

  const rest = new Request();

  switch (status) {
    case 'online': {
      const normalizeReqPath = getNormalizedPath(useStore, {
        xhrPath,
        startPath,
        storeLoad,
      });

      try {
        const res = await rest.sendRequest(
          normalizeReqPath,
          methodRequst,
          {
            actionType: actionsTypes.$LOAD_CURRENT_DATA,
            methodQuery,
            options,
          },
          true,
        );

        const [items, error] = rest.parseResponse(res);
        const { dataItems: copyStore = [] } = items;

        if (error) throw new Error(error);

        const dep = {
          noCorsClient,
          requestError,
          copyStore,
          sortBy,
          pathValid,
          schema,
          storeLoad,
          clientDB,
          methodQuery,
          primaryKey,
          params,
          saveComponentStateAction,
          multipleLoadData,
          errorRequestAction,
          isLocalUpdate,
          indStoreName,
          rest,
          sync,
        };

        await coreUpdaterDataHook(dispatch, dep);
      } catch (error) {
        const { status: errorStatus = '', response: { status: responseStatus = 503 } = {} } = error || {};
        const dep = {
          Request,
          setStatus,
          params,
          errorRequestAction,
          loadCurrentData,
          multipleLoadData,
          copyStore: [],
          getState,
          storeLoad,
          saveComponentStateAction,
          isLocalUpdate,
          indStoreName,
          path,
          rest,
          noCorsClient,
          requestError,
          sortBy,
          pathValid,
          schema,
          clientDB,
          methodQuery,
          primaryKey,
        };

        if (responseStatus === 404 || errorStatus === 404) {
          await coreUpdaterDataHook(dispatch, { ...dep });
          return;
        }

        await errorHook(error, dispatch, dep, loadCurrentData.bind(this, params));
      }
      return;
    }

    default: {
      const dep = {
        storeLoad,
        methodQuery,
        schema,
        clientDB,
        sortBy,
        params,
        pathValid,
        requestError,
        primaryKey,
        saveComponentStateAction,
        errorRequestAction,
      };

      dispatch(setStatus({ params, path }));
      const cursor = await clientDB.getAllItems(indStoreName ? indStoreName : storeLoad);
      return await sucessEvent(dispatch, dep, 'offline', false, cursor);
    }
  }
};

const multipleLoadData = (params) => async (dispatch, getState, { schema, Request }) => {
  const { requestsParamsList = [], pipe = true, saveModuleName = '', clientDB = null } = params;

  const primaryKey = 'uuid';
  const { requestError, status = 'online' } = getState().publicReducer;

  if (status !== 'online') return;

  switch (pipe) {
    case false: {
      /** TODO: for future release */
      return;
    }
    default: {
      const responseList = [];
      const rest = new Request();

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
          path: pathName = '',
        } = requestParam;
        const path = saveModuleName ? saveModuleName : pathName;
        let isLocalUpdate = true;
        const pathValid = path.includes('_') ? path : path.split(regExpRegister.MODULE_ID)[0];

        const normalizeReqPath = getNormalizedPath(useStore, {
          xhrPath,
          startPath,
          storeLoad,
        });

        try {
          const res = await rest.sendRequest(
            normalizeReqPath,
            methodRequst,
            {
              actionType: actionsTypes.$LOAD_NOTIFICATION_DATA,
              methodQuery,
              options,
            },
            true,
          );
          const [items, error] = rest.parseResponse(res);

          if (error) {
            console.error(error);
            break;
          }

          const { dataItems: copyStore = [] } = items;

          if (error) throw new Error(error);

          const dep = {
            noCorsClient,
            requestError,
            copyStore,
            sortBy,
            pathValid,
            schema,
            storeLoad,
            clientDB,
            methodQuery,
            primaryKey,
            saveComponentStateAction,
            errorRequestAction,
            isLocalUpdate,
          };

          responseList.push({ parsedItems: items, dep });
        } catch (error) {
          console.error('Error in mass loading,', error);
        }
      }
      let hookData = [];

      for await (let res of responseList) {
        const { dep } = res;
        const resultHook = await coreUpdaterDataHook(dispatch, dep, true);
        if (resultHook) hookData.push(resultHook);
      }

      if (hookData.length) {
        dispatch(saveComponentStateAction({ stateList: [...hookData], multiple: true, loading: false }));
      }
    }
  }
};

export { loadCurrentData, multipleLoadData };
