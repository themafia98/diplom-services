import {
  sucessEvent,
  errorHook,
  coreUpdaterDataHook,
  routePathNormalise,
  findData,
  routeParser,
} from 'Utils';
import { saveComponentStateAction, loadFlagAction, openPageWithDataAction, setActiveTabAction } from '../';
import { errorRequestAction, setStatus } from '../../publicActions';
import actionsTypes from 'actions.types';
import regExpRegister from 'Utils/Tools/regexpStorage';
import _ from 'lodash';
import { message } from 'antd';
import { makeApiAction, getActionStore } from 'Utils/Api';

const loadCurrentData = (params) => async (dispatch, getState, { schema, Request }) => {
  const {
    action = '',
    path: pagePath = '',
    sortBy = '',
    options = {},
    optionsForParse = {},
    clientDB = null,
  } = params;

  const { noCorsClient = false, shouldSetLoading = false, sync = false } = optionsForParse || {};

  let isLocalUpdate = true;
  const primaryKey = 'uuid';
  const pathValid = pagePath.includes('_') ? pagePath : pagePath.split(regExpRegister.MODULE_ID)[0];
  const {
    router,
    publicReducer: { requestError, status = 'online' },
  } = getState();

  const isExist = router.routeData && router.routeData[pathValid];

  if (isExist && !router.routeData[pathValid].load) {
    dispatch(loadFlagAction({ path: pathValid, load: true, loading: true }));
  } else if (pathValid && shouldSetLoading) {
    dispatch(loadFlagAction({ path: pathValid, loading: true }));
  }

  const store = getActionStore(action);
  const rest = new Request();

  switch (status) {
    case 'online': {
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

        const dep = {
          requestError,
          noCorsClient,
          copyStore,
          sortBy,
          pathValid,
          schema,
          storeLoad: store,
          clientDB,
          primaryKey,
          params,
          saveComponentStateAction,
          multipleLoadData,
          errorRequestAction,
          isLocalUpdate,
          rest,
          sync,
        };

        await coreUpdaterDataHook(dispatch, dep);
      } catch (error) {
        const { status: errorStatus = '', response: { status: responseStatus = 503 } = {} } = error || {};
        const dep = {
          requestError,
          Request,
          setStatus,
          params,
          errorRequestAction,
          loadCurrentData,
          multipleLoadData,
          copyStore: [],
          getState,
          storeLoad: store,
          saveComponentStateAction,
          isLocalUpdate,
          path: pagePath,
          rest,
          noCorsClient,
          sortBy,
          pathValid,
          schema,
          clientDB,
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
        storeLoad: store,
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

      dispatch(setStatus({ params, path: pagePath }));
      const cursor = await clientDB.getAllItems('');
      return await sucessEvent(dispatch, dep, 'offline', false, cursor);
    }
  }
};

const multipleLoadData = (params) => async (dispatch, getState, { schema, Request }) => {
  const { requestsParamsList = [], saveModuleName = '', clientDB = null } = params;

  const primaryKey = 'uuid';
  const {
    publicReducer: { requestError, status = 'online' },
  } = getState();

  if (status !== 'online') return;

  const responseList = [];
  const rest = new Request();

  for await (let requestParam of requestsParamsList) {
    const {
      action = '',
      options = {},
      noCorsClient = false,
      sortBy = '',
      path: pathName = '',
    } = requestParam;
    const path = saveModuleName ? saveModuleName : pathName;
    let isLocalUpdate = true;
    const pathValid = path.includes('_') ? path : path.split(regExpRegister.MODULE_ID)[0];

    const [url, body, method = 'GET'] = makeApiAction(
      action,
      pathValid,
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
};

const openTab = ({ uuid, action, depKey = '', data = {}, openType = '' }) => async (dispatch, getState) => {
  const {
    publicReducer: {
      appConfig = {},
      udata: { _id: uid = '' },
    },
    router: { activeTabs = [], routeData = {} },
  } = getState();

  if (appConfig?.tabsLimit <= activeTabs.length) {
    message.error('Максимальное количество вкладок:' + appConfig?.tabsLimit);
    return;
  }

  if (openType) {
    const { moduleId = '', page = '' } = routeParser({ path: action, pageType: openType });
    if (!moduleId || !page) {
      message.warn('Страницу открыть по ссылке не удалось');
      return;
    }

    const tabPage = page.split('#')[0];
    const indexTab = activeTabs.findIndex((tab) => tab.includes(tabPage) && tab.includes(uuid));

    if (indexTab !== -1) {
      dispatch(setActiveTabAction(activeTabs[indexTab]));
      return;
    }

    if (!data || (data && _.isEmpty(data))) {
      message.warning('Данные при переходе по ссылке не найдены.');
      return;
    }

    const activePageParsed = routePathNormalise({
      pathType: openType,
      pathData: { page, moduleId, key: uuid },
    });

    const { path } = activePageParsed || {};

    dispatch(
      openPageWithDataAction({
        activePage: {
          ...activePageParsed,
          path,
          from: openType,
        },
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
    newData = storeList.find((it) => it?._id === uuid) || {};
  }
  const isDefaultAction = regExpRegister.INCLUDE_MODULE.test(action);
  const page = !isDefaultAction ? `${action}Module` : action;
  const moduleId = !(uid === uuid) && isCabinetRedirect ? '$$personalPage$$' : '';

  if (!uuid || !page || !newData || (newData && _.isEmpty(newData))) {
    message.warn('Страницу открыть не удалось');
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

  const indexTab = activeTabs.findIndex(
    (tab) => (uid === uuid && tab === page) || (tab.includes(page) && tab.includes(uuid)),
  );

  if (indexTab === -1) {
    dispatch(
      openPageWithDataAction({
        activePage,
        routeDataActive: { ...data, key: uuid },
      }),
    );
    return;
  }

  dispatch(setActiveTabAction(activeTabs[indexTab]));
};


const openTab = ({ uuid, action, depKey = '', data = {}, openType = '' }) => async (dispatch, getState) => {
  const {
    publicReducer: {
      appConfig = {},
      udata: { _id: uid = '' },
    },
    router: { activeTabs = [], routeData = {} },
  } = getState();

  if (appConfig?.tabsLimit <= activeTabs.length) {
    message.error('Максимальное количество вкладок:' + appConfig?.tabsLimit);
    return;
  }

  if (openType) {
    const { moduleId = '', page = '' } = routeParser({ path: action, pageType: openType });
    if (!moduleId || !page) {
      message.warn('Страницу открыть по ссылке не удалось');
      return;
    }

    const tabPage = page.split('#')[0];
    const indexTab = activeTabs.findIndex((tab) => tab.includes(tabPage) && tab.includes(uuid));

    if (indexTab !== -1) {
      dispatch(setActiveTabAction(activeTabs[indexTab]));
      return;
    }

    if (!data || (data && _.isEmpty(data))) {
      message.warning('Данные при переходе по ссылке не найдены.');
      return;
    }

    const activePageParsed = routePathNormalise({
      pathType: openType,
      pathData: { page, moduleId, key: uuid },
    });

    const { path } = activePageParsed || {};

    dispatch(
      openPageWithDataAction({
        activePage: {
          ...activePageParsed,
          path,
          from: openType,
        },
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
    newData = storeList.find((it) => it?._id === uuid) || {};
  }
  const isDefaultAction = regExpRegister.INCLUDE_MODULE.test(action);
  const page = !isDefaultAction ? `${action}Module` : action;
  const moduleId = !(uid === uuid) && isCabinetRedirect ? '$$personalPage$$' : '';

  if (!uuid || !page || !newData || (newData && _.isEmpty(newData))) {
    message.warn('Страницу открыть не удалось');
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

  const indexTab = activeTabs.findIndex(
    (tab) => (uid === uuid && tab === page) || (tab.includes(page) && tab.includes(uuid)),
  );

  if (indexTab === -1) {
    dispatch(
      openPageWithDataAction({
        activePage,
        routeDataActive: { ...data, key: uuid },
      }),
    );
    return;
  }

  dispatch(setActiveTabAction(activeTabs[indexTab]));
};

export { loadCurrentData, multipleLoadData, openTab };
