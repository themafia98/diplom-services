import { sucessEvent, routePathNormalise, findData, routeParser, findUser, checkPageAvailable } from 'Utils';
import reduxCoreThunk from 'Redux/core';
import { saveComponentStateAction, loadFlagAction, openPageWithDataAction, setActiveTabAction } from '../';
import { errorRequestAction, setStatus } from '../../publicActions';
import actionsTypes from 'actions.types';
import regExpRegister from 'Utils/Tools/regexpStorage';
import _ from 'lodash';
import { message } from 'antd';
import { makeApiAction, getActionStore } from 'Utils/Api';
import { setSystemMessageAction } from 'Redux/actions/systemActions';
import { APP_STATUS } from 'App.constant';

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
    dispatch(loadFlagAction({ path: pathValid, load: true, loading: true }));
  } else if (pathValid && shouldSetLoading) {
    dispatch(loadFlagAction({ path: pathValid, loading: true }));
  }

  const store = getActionStore(action);
  const rest = new Request();

  switch (status) {
    case APP_STATUS.ON: {
      const dep = {
        requestError,
        noCorsClient,
        sortBy,
        pathValid,
        schema,
        storeLoad: store,
        clientDB,
        uuid: 'uuid',
        params,
        saveComponentStateAction,
        multipleLoadData,
        errorRequestAction,
        isLocalUpdate,
        rest,
        sync,
        add,
      };

      if (force) {
        dep.copyStore = result;
        await coreDataUpdater(dispatch, dep);
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

        dep.copyStore = copyStore;

        await coreDataUpdater(dispatch, dep);
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
          uuid: 'uuid',
        };

        if (responseStatus === 404 || errorStatus === 404) {
          await coreDataUpdater(dispatch, { ...dep });
          return;
        }

        await errorThunk(error, dispatch, dep, loadCurrentData.bind(this, params));
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
        saveComponentStateAction,
        errorRequestAction,
      };

      dispatch(setStatus({ params, path: pagePath }));
      const cursor = await clientDB.getAllItems('');
      return await sucessEvent(dispatch, dep, APP_STATUS.OFF, false, cursor);
    }
  }
};

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
    const resultHook = await coreDataUpdater(dispatch, dep, true);
    if (resultHook) hookData.push(resultHook);
  }

  if (hookData.length) {
    dispatch(saveComponentStateAction({ stateList: [...hookData], multiple: true, loading: false }));
  }
};

const openTab = ({ uuid, action, depKey = '', data = null, openType = '' }) => async (
  dispatch,
  getState,
  { Request },
) => {
  const { publicReducer, router } = getState();
  const { activeTabs = [], routeData = {} } = router;
  const { appConfig = {}, udata } = publicReducer;
  const { _id: uid } = udata;

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

    if (!data) {
      message.warning('Данные при переходе по ссылке не найдены.');
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
      console.error('Not access for open page', activePage);
      return;
    }

    dispatch(
      openPageWithDataAction({
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
    dispatch(setSystemMessageAction({ msg: 'Action in progress...', type: 'loading' }));
    normalizeData = await findUser(uuid || uid);
  }

  if (!normalizeData && !newData && uuid !== uid) {
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
      openPageWithDataAction({
        activePage,
        routeDataActive: { ...pageData, key: uuid },
      }),
    );
    return;
  }

  dispatch(setActiveTabAction(activeTabs[indexTab]));
};

export { loadCurrentData, multipleLoadData, openTab };
