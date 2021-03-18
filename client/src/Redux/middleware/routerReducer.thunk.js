import { sucessEvent, routePathNormalise, findData, routeParser, findUser, checkPageAvailable } from 'Utils';
import reduxCoreThunk from 'Redux/core';
import actionsTypes from 'actions.types';
import regExpRegister from 'Utils/Tools/regexpStorage';
import _ from 'lodash';
import { makeApiAction, getActionStore } from 'Utils/Api';
import { APP_STATUS } from 'App.constant';
import { setSystemMessage } from 'Redux/reducers/systemReducer.slice';
import { setAppStatus, setRequestError } from 'Redux/reducers/publicReducer.slice';
import {
  openPageWithData,
  refreshRouterData,
  setActiveTab,
  setIsLoadData,
} from 'Redux/reducers/routerReducer.slice';

const { errorThunk, coreDataUpdater } = reduxCoreThunk;

const loadCurrentData = (params) => async (dispatch, getState, { schema, Request }) => {
  const {
    action = '',
    path: pagePath = '',
    sortBy = '',
    options = {},
    optionsForParse = {},
    clientDB = null,
    result = null,
  } = params;

  const { force = false, noCorsClient = false, shouldSetLoading = false, sync = false, add = false } =
    optionsForParse || {};

  let isLocalUpdate = true;
  const pathValid = pagePath.includes('_') ? pagePath : pagePath.split(regExpRegister.MODULE_ID)[0];
  const { router, publicReducer } = getState();
  const { requestError, status = APP_STATUS.ON } = publicReducer;

  const isExist = router.routeData && router.routeData[pathValid];

  if (isExist && !router.routeData[pathValid].load) {
    dispatch(setIsLoadData({ path: pathValid, load: true, loading: true }));
  } else if (pathValid && shouldSetLoading) {
    dispatch(setIsLoadData({ path: pathValid, loading: true }));
  }

  const store = getActionStore(action);
  const rest = new Request();

  switch (status) {
    case APP_STATUS.ON: {
      const dependencies = {
        requestError,
        noCorsClient,
        sortBy,
        pathValid,
        storeLoad: store,
        clientDB,
        uuid: 'uuid',
        params,
        isLocalUpdate,
        sync,
        add,
      };

      if (force) {
        dependencies.copyStore = result;
        await dispatch(coreDataUpdater(dependencies));
        return;
      }

      const [url, body, method = 'GET'] = makeApiAction(
        action,
        pathValid,
        options,
        actionsTypes.$LOAD_CURRENT_DATA,
      );

      try {
        const res = await rest.sendRequest(url, method, body, true);

        const [items, error] = rest.parseResponse(res);
        const { dataItems: copyStore = [] } = items;

        if (error) throw new Error(error);

        dependencies.copyStore = copyStore;

        await dispatch(coreDataUpdater(dependencies));
      } catch (error) {
        const { status: errorStatus = '', response: { status: responseStatus = 503 } = {} } = error || {};

        const dependenciesForParseError = {
          requestError,
          params,
          copyStore: [],
          storeLoad: store,
          isLocalUpdate,
          path: pagePath,
          noCorsClient,
          sortBy,
          pathValid,
          clientDB,
          uuid: 'uuid',
        };

        if (responseStatus === 404 || errorStatus === 404) {
          await dispatch(coreDataUpdater(dependencies));
          return;
        }

        dispatch(errorThunk(error, dependenciesForParseError, loadCurrentData.bind(this, params)));
      }
      return;
    }

    default: {
      const dep = {
        storeLoad: store,
        schema,
        clientDB,
        sortBy,
        params,
        pathValid,
        requestError,
        uuid: 'uuid',
        refreshRouterData,
        setRequestError,
      };

      dispatch(setAppStatus({ params, path: pagePath }));
      const cursor = await clientDB.getAllItems('');
      return await sucessEvent(dispatch, dep, APP_STATUS.OFF, false, cursor);
    }
  }
};

/** @deprecated */
const multipleLoadData = (params) => async (dispatch, getState, { schema, Request }) => {
  const { requestsParamsList = [], saveModuleName = '', clientDB = null } = params;

  const { publicReducer } = getState();
  const { requestError, status = APP_STATUS.ON } = publicReducer;

  if (status !== APP_STATUS.ON) return;

  const responseList = [];
  const rest = new Request();

  for await (let requestParam of requestsParamsList) {
    const {
      action = '',
      options = {},
      noCorsClient = false,
      sortBy = '',
      path: pathName = '',
      prefix = '',
    } = requestParam;
    const path = saveModuleName ? saveModuleName : pathName;
    let isLocalUpdate = true;
    const pathValid = path.includes('_') ? path : path.split(regExpRegister.MODULE_ID)[0];

    const [url, body, method = 'GET'] = makeApiAction(
      action,
      pathValid.replace(prefix, ''),
      options,
      actionsTypes.$LOAD_CURRENT_DATA,
    );

    try {
      const res = await rest.sendRequest(url, method, body, true);
      const [items, error] = rest.parseResponse(res);

      if (error) {
        console.error(error);
        continue;
      }

      const store = getActionStore(action);
      const { dataItems: copyStore = [] } = items;

      if (error) throw new Error(error);

      const dep = {
        noCorsClient,
        requestError,
        copyStore,
        sortBy,
        pathValid,
        schema,
        storeLoad: store,
        clientDB,
        methodQuery: body?.params?.query,
        uuid: 'uuid',
        refreshRouterData,
        setRequestError,
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
    const resultHook = await dispatch(coreDataUpdater(dep, true));
    if (resultHook) {
      hookData.push(resultHook);
    }
  }

  if (hookData.length) {
    dispatch(refreshRouterData({ stateList: [...hookData], multiple: true, loading: false }));
  }
};

const openTab = ({ uuid, action, depKey = '', data = null, openType = '' }) => async (
  dispatch,
  getState,
  { Request },
) => {
  const { publicReducer, router } = getState();
  const { activeTabs, routeData } = router;
  const { appConfig = {}, udata } = publicReducer;
  const { _id: uid } = udata;

  if (appConfig?.tabsLimit <= activeTabs.length) {
    console.error('Max tabs limit:' + appConfig?.tabsLimit);
    return;
  }

  if (openType) {
    const { moduleId = '', page = '' } = routeParser({ path: action, pageType: openType });
    if (!moduleId || !page) {
      dispatch(setSystemMessage({ msg: 'Open page error', type: 'warn' }));
      return;
    }

    const tabPage = page.split('#')[0];
    const indexTab = activeTabs.findIndex((tab) => tab.includes(tabPage) && tab.includes(uuid));

    if (indexTab !== -1) {
      dispatch(setActiveTab(activeTabs[indexTab]));
      return;
    }

    if (!data) {
      dispatch(setSystemMessage({ msg: 'Invalid data for open page', type: 'error' }));
      console.error(data);
      return;
    }

    const activePageParsed = routePathNormalise({
      pathType: openType,
      pathData: { page, moduleId, key: uuid },
    });

    const { path } = activePageParsed || {};

    const activePage = {
      ...activePageParsed,
      path,
      from: openType,
    };

    const isAvailablePage = await checkPageAvailable(activePage, new Request());

    if (!isAvailablePage) {
      dispatch(setSystemMessage({ msg: 'Not access for open this', type: 'warn' }));
      console.warn('Not access for open page', activePage);
      return;
    }

    dispatch(
      openPageWithData({
        activePage,
        routeDataActive: { ...data },
      }),
    );
    return;
  }

  const isCabinetRedirect = action?.includes('cabinet');
  let newData = data;

  if (data && typeof data === 'object' && depKey) {
    const store = isCabinetRedirect ? 'users' : action;
    const { [store]: storeList = [] } = findData(_.isEmpty(data) ? routeData : data, depKey) || {};
    newData = storeList.find((it) => it?._id === uuid) || null;
  }
  const isDefaultAction = regExpRegister.INCLUDE_MODULE.test(action);
  const page = !isDefaultAction ? `${action}Module` : action;
  const moduleId = !(uid === uuid) && isCabinetRedirect ? '$$personalPage$$' : '';

  const shouldBeTryLoad = !uuid || !page || !newData || (newData && _.isEmpty(newData));

  let normalizeData = null;

  if (shouldBeTryLoad && uuid !== uid) {
    dispatch(setSystemMessage({ msg: 'Action in progress...', type: 'loading' }));
    normalizeData = await findUser(uuid || uid);
  }

  if (!normalizeData && !newData && uuid !== uid) {
    dispatch(setSystemMessage({ msg: 'Error on open page', type: 'error' }));
    console.error('Error on open page');
    const trace = {
      uuid,
      page,
      newData,
    };
    console.error('Bad open page', trace);
    return;
  }

  const activePage = routePathNormalise({
    pathType: uid === uuid ? 'module' : 'moduleItem',
    pathData: { page, moduleId, key: uuid },
  });

  const isAvailablePage = await checkPageAvailable(activePage, new Request());

  if (!isAvailablePage) {
    console.error('Not access for open page');
    return;
  }

  const indexTab = activeTabs.findIndex(
    (tab) => (uid === uuid && tab === page) || (tab.includes(page) && tab.includes(uuid)),
  );

  if (indexTab === -1) {
    const pageData = normalizeData ? normalizeData : newData;
    dispatch(
      openPageWithData({
        activePage,
        routeDataActive: { ...pageData, key: uuid },
      }),
    );
    return;
  }

  dispatch(setActiveTab(activeTabs[indexTab]));
};

export { loadCurrentData, multipleLoadData, openTab };
