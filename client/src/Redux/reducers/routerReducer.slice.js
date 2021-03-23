import regExpRegister from 'Utils/Tools/regexpStorage';
import { publicSlice } from './publicReducer.slice';
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  path: null,
  currentActionTab: 'mainModule',
  activeTabs: [],
  routeDataActive: {},
  routeData: {},
  load: false,
  partDataPath: null,
  shouldUpdate: false,
};

const routerReducer = createSlice({
  name: 'routerReducer',
  initialState,
  reducers: {
    loadSaveRouter: {
      // LOAD_SAVE_ROUTER
      reducer: (state, { payload }) => {
        const { activeTabs = [], path = '' } = payload;

        const normalizeRoute = {
          ...state,
          ...payload,
        };

        if (!activeTabs.includes('mainModule')) {
          normalizeRoute.activeTabs.push('mainModule');
        }

        if (!path) {
          normalizeRoute.path = 'mainModule';
        }

        state = normalizeRoute;
      },
      prepare: (routeData) => ({ payload: routeData }),
    },
    createTab: {
      // ADD_TAB
      reducer: (state, { payload }) => {
        const { tab: configTab, path: pathDefault = '', config } = payload;
        const { path: configPath = '' } = configTab || {};

        const withConfig = config && !!Object.keys(config).length;
        const isString = typeof payload === 'string';

        const path = withConfig ? configPath : pathDefault;
        const tab = isString ? payload : path;

        let newRouteData = state.routeData;

        if (withConfig) {
          newRouteData[path] = { config };
        }

        state.path = tab && !path ? tab : path;
        state.activeTabs.push(tab);
        state.shouldUpdate = true;
        state.currentActionTab = tab;
        state.routeData = newRouteData;
      },
      prepare: (tabConfig) => ({ payload: tabConfig }),
    },
    setActiveTab: {
      // SET_ACTIVE_TAB
      reducer: (state, { payload }) => {
        const withConfig = payload && typeof payload === 'object' && !!payload?.config;

        const { config = {}, tab: tabWithConfig = '' } = withConfig ? payload : {};
        const { hardCodeUpdate = true } = config;

        const tabValue = withConfig ? tabWithConfig : typeof payload === 'string' ? payload : payload?.tab;

        const content =
          typeof tabValue === 'string'
            ? tabValue?.split(regExpRegister.MODULE_ID)[1]
            : payload.tab?.split(regExpRegister.MODULE_ID)[1];

        let currentActive = null;
        let isDataPage = false;

        if (content || withConfig) {
          isDataPage = true;
          currentActive = withConfig && !content ? { config } : state.routeData[content];
        }

        const isExistModule = !!state.routeData[tabValue] || null;
        const { config: { hardCodeUpdate: updater } = {} } = isExistModule ? state.routeData[tabValue] : {};

        const routeData = state.routeData;

        if (isExistModule) {
          routeData[tabValue].load = false;
          routeData[tabValue].hardCodeUpdate = hardCodeUpdate ? !!payload : null;
        }

        const shouldUpdate = updater || (updater === undefined && hardCodeUpdate);

        state.path = tabValue;
        state.currentActionTab = tabValue;
        state.routeDataActive = isDataPage
          ? currentActive
          : { ...state.routeData[tabValue], ...state.routeDataActive };
        state.routeData = routeData;
        state.shouldUpdate = shouldUpdate;
      },
      prepare: (activeTabConfig) => ({ payload: activeTabConfig }),
    },
    removeTab: {
      // REMOVE_TAB
      reducer: (state, { payload }) => {
        const { type, path } = payload;
        const { _id: id } = state.routeDataActive;

        const entityId = path.split(regExpRegister.MODULE_ID)[1];
        let deleteKey = type === 'itemTab' ? entityId : path;
        let deleteKeyOnce = !deleteKey ? path : null;

        const filterArray = state.activeTabs.filter((tab, i) => {
          if (
            deleteKey &&
            ((type === 'itemTab' && tab.includes(entityId) && entityId === deleteKey) ||
              (!tab.split(regExpRegister.MODULE_ID)[1] && tab.includes(path)))
          )
            return false;
          return tab !== payload;
        });

        const keys = Object.keys(state.routeData);
        const routeDataNew = {};

        for (let i = 0; i < keys.length; i++) {
          if (
            (type === 'itemTab' && state.routeData[keys[i]].key !== deleteKey) ||
            !keys[i].includes(deleteKey)
          ) {
            routeDataNew[keys[i]] = state.routeData[keys[i]];
          }
        }

        const indexFind = state.activeTabs.findIndex((it) => it === state.currentActionTab);
        const currentFind = filterArray.findIndex((tab) => tab === state.currentActionTab);
        let nextTab = null;

        if (currentFind !== -1) nextTab = state.currentActionTab;
        else if (indexFind === 0) nextTab = filterArray[indexFind];
        else nextTab = filterArray[indexFind - 1];

        const parsedTabEntity = nextTab?.split(regExpRegister.MODULE_ID)?.[1];
        const uuidEntityItem = typeof nextTab === 'string' && type === 'itemTab' ? parsedTabEntity : nextTab;

        let current = null;

        if (!nextTab) {
          console.warn('Next tab not found');
          return state;
        }
        const { [parsedTabEntity]: tabItem = {} } = routeDataNew || {};
        const { _id: tabId = '' } = tabItem || {};

        const isSimple = routeDataNew[parsedTabEntity] && tabId === parsedTabEntity;

        const isDelete = state.routeDataActive && uuidEntityItem && !deleteKeyOnce;
        const isNext = state.routeDataActive && parsedTabEntity && id === parsedTabEntity;

        current = isSimple
          ? routeDataNew[parsedTabEntity]
          : isDelete && uuidEntityItem && routeDataNew[uuidEntityItem]
          ? routeDataNew[uuidEntityItem]
          : isNext
          ? state.routeDataActive
          : {};

        const selectModule = nextTab ? nextTab || parsedTabEntity || nextTab : nextTab;

        state.currentActionTab = nextTab || 'mainModule';
        state.activeTabs = filterArray;
        state.routeDataActive = current || {};
        state.routeData = routeDataNew;
        state.shouldUpdate = !state.routeData[selectModule] ? false : true;
      },
      prepare: (tabConfig) => ({ payload: tabConfig }),
    },
    setEndDndTab: {
      // ON_END_DRAG_TAB
      reducer: (state, { payload }) => {
        state.activeTabs = payload.map(({ EUID = '' }) => EUID);
      },
      prepare: (tabsList) => ({ payload: tabsList }),
    },
    setUpdate: {
      // SET_UPDATE
      reducer: (state, { payload }) => {
        state.shouldUpdate = payload;
      },
      prepare: (shouldUpdate) => ({ payload: shouldUpdate }),
    },
    openPageWithData: {
      // OPEN_PAGE_WITH_DATA
      reducer: (state, { payload }) => {
        const { activePage = {}, routeDataActive: RDA = {} } = payload;
        const { key: keyRouteData = '', _id: id = '' } = RDA;
        const { from = 'default', moduleId = '' } = activePage;
        const isLinkRedirect = moduleId === '$link$';

        const isAccessRedirect = isLinkRedirect || activePage?.key === keyRouteData;
        const isStrictEqaulEntity = activePage?.key === id;

        const isEmptyActivePage = !activePage || typeof activePage !== 'object';
        const isEqualKeys = (activePage && isAccessRedirect) || isStrictEqaulEntity;

        if (isEmptyActivePage || (!isEqualKeys && moduleId)) {
          return;
        }

        const { path: pathPage = '' } = activePage;

        /**
         * 07.08.2020
         * @deprecated "___link" is legacy key
         * Here to support the old version link redirect
         */
        const linkEntity = pathPage.includes('___link') && pathPage.split(regExpRegister.MODULE_ID)[1];
        let currentActionTab = pathPage;

        if (linkEntity) {
          const pathLink = linkEntity ? pathPage.split('___link')[0] : pathPage;
          const moduleName = pathLink.split('#')[0];
          currentActionTab = `${moduleName}__${linkEntity}`;
        }

        if (!pathPage) {
          return;
        }

        const validKey = id || keyRouteData || 'undefiendModule';
        const isString = typeof RDA === 'string';

        let routeDataActive = {};

        if (!isString) {
          routeDataActive = { ...(RDA || {}) };
          routeDataActive.from = from;

          state.routeData[validKey] = { ...RDA, from };
        } else if (!!state.routeData[pathPage]) {
          state.routeData[pathPage].from = from;
          state.routeData[validKey] = { ...state.routeData[pathPage], from };
        }

        state.currentActionTab = currentActionTab;
        state.activeTabs.push(currentActionTab);
        state.routeDataActive = routeDataActive;
      },
      prepare: (pageData) => ({ payload: pageData }),
    },
    addToRouteData: {
      // ADD_TO_ROUTE_DATA
      reducer: (state, { payload }) => {
        const { path, saveData = {}, loading } = payload;

        let savedCurrentData = {};

        if (state.routeData[path]) {
          savedCurrentData = state.routeData[path];
        }

        const shouldUpdate = loading !== undefined ? loading : !!state.routeData[path]?.loading;

        state.routeData[path] = savedCurrentData;
        state.routeData[path].saveData = saveData;
        state.routeData[path].loading = shouldUpdate;
        state.routeData[path].shouldUpdate = shouldUpdate;
      },
      prepare: (routeDataConfg) => ({ payload: routeDataConfg }),
    },
    refreshRouterData: {
      // SAVE_STATE
      reducer: (state, { payload }) => {
        const {
          multiple = false,
          stateList = null,
          params: paramsAction = {},
          loading,
          path: pathAction = '',
          shouldUpdate = false,
          load = false,
          add = false,
        } = payload;

        const isLink = pathAction.includes('__link') && pathAction.split(regExpRegister.MODULE_ID)[1];
        const pathLink = isLink ? pathAction.split(regExpRegister.MODULE_ID)[1] : pathAction;
        const path = pathLink.split('__link')[0];

        if (stateList && Array.isArray(stateList) && multiple) {
          const modulesState = stateList.reduce((newState, actionItem) => {
            const { path = '' } = actionItem;

            let storeName = path ? path.split(regExpRegister.INCLUDE_MODULE)[0] : '';
            storeName = storeName[storeName.length] !== 's' ? `${storeName}s` : storeName;

            if (!storeName) return newState;
            let items = actionItem[storeName];

            if (!actionItem[storeName] && storeName.includes('contact')) {
              items = actionItem['news'];
            }

            const isEmptyParams = JSON.stringify(paramsAction) === '{}' && !!state.routeData[path];
            const params = isEmptyParams ? state.routeData[path]?.params : paramsAction;
            const currentStateData = state.routeData[path] ? state.routeData[path] : {};

            if (path) {
              return {
                ...newState,
                [path]: {
                  ...currentStateData,
                  ...actionItem,
                  [storeName]: items,
                  shouldUpdate: false,
                  loading,
                  params,
                },
              };
            } else return newState;
          }, {});

          const shouldUpdateList = Object.keys(state.routeData).every((key) => {
            if (stateList.some((actionItem) => actionItem?.path && key === actionItem.path)) {
              return state.routeData[key]?.load;
            }
            return true;
          });

          if (shouldUpdateList) {
            state.routeData = {
              ...state.routeData,
              ...modulesState,
            };

            return;
          }
        }

        state.routeData[path] = payload;

        let storeName = path.split(regExpRegister.INCLUDE_MODULE)[0];
        storeName = storeName[storeName.length] !== 's' ? `${storeName}s` : storeName;

        if (path.includes('#private')) {
          storeName = 'streamList';
        }

        if (state.routeData[path][storeName] && state.routeData[path] && state.routeData[path][storeName]) {
          const items = state.routeData[path][storeName];
          const currentStateData = state.routeData[path] ? state.routeData[path] : {};

          state.routeData[path] = {
            ...currentStateData,
            ...state.routeData[path],
            shouldUpdate: false,
            load: true,
            loading,
            [storeName]: items,
          };
        }

        if (storeName.includes('cabinet')) {
          storeName = 'users';
        }

        const addItem = add && payload[storeName] ? payload[storeName] : null;
        let currentStateData = {};
        let normalizeRouteData = null;

        if (state.routeData[path]) {
          currentStateData = { ...state.routeData[path], shouldUpdate: false };
        }

        if (add && addItem && addItem?._id) {
          normalizeRouteData = { [addItem._id]: addItem };
        }

        let additionalList = {};

        if (add && addItem) {
          additionalList = { [storeName]: [addItem] };
        }

        const routeDataActive = addItem ? addItem : state.routeDataActive;

        state.routeData[path] = {
          ...currentStateData,
          ...payload,
          ...additionalList,
          shouldUpdate: false,
          loading,
        };

        if (normalizeRouteData && addItem && addItem?._id) {
          state.routeData[addItem._id] = addItem;
        }

        if (path) {
          state.path = path;
          state.load = load;
          state.shouldUpdate = shouldUpdate;
          state.routeDataActive = routeDataActive;
          return;
        }
      },
      prepare: (newRouterData) => ({ payload: newRouterData }),
    },
    refreshRouteDataItem: {
      // UPDATE_ITEM
      reducer: (state, { payload }) => {
        const currentPath = state.path;

        const {
          id,
          updateBy = '_id',
          updaterItem = {},
          store = currentPath.split(regExpRegister.MODULE_ID)[0],
          parsedRoutePath = {},
        } = payload;
        const { itemId = '', path = '' } = parsedRoutePath || {};

        const isExist = !!state.routeDataActive && !!state.routeDataActive[updateBy];
        const currentModule = path.split(regExpRegister.MODULE_ID);

        if (!path || !currentModule) {
          return;
        }

        const [moduleName = '', entityId = ''] = currentModule || [];
        const itemName = moduleName && entityId ? entityId : moduleName;

        const { [store]: dataArray = [], ...data } =
          !itemId && state.routeData[currentModule[0]]
            ? state.routeData[itemName]
            : currentModule[1] && itemId && state.routeData[itemId]
            ? state.routeData[itemId]
            : {};

        const dataList = Array.isArray(dataArray) && dataArray?.length ? dataArray : data;

        const updateCurrent = isExist && state.routeDataActive[updateBy] === id ? true : false;

        let newStore = dataList;

        if (Array.isArray(dataList) && dataList.length) {
          newStore = dataList.map((item) => {
            if (item[updateBy] && item[updateBy] !== id) return item;
            const isObject = updaterItem && typeof updaterItem === 'object';
            return isObject
              ? {
                  ...updaterItem,
                }
              : updaterItem;
          });
        }

        if (updateCurrent) {
          state.routeDataActive = updaterItem;
        } else if (!state.routeDataActive) {
          state.routeDataActive = {};
        }

        state.routeData[id] = updaterItem;

        if (dataList) {
          state.routeData[itemName][store] =
            Array.isArray(newStore) && newStore.length
              ? newStore
              : !!state.routeData[itemName][store]
              ? [...Array.from(state.routeData[currentModule][store]), newStore]
              : [newStore];
        }
      },
      prepare: (routeDataItemConfig) => ({ payload: routeDataItemConfig }),
    },
    setIsLoadData: {
      // SET_FLAG_LOAD_DATA
      reducer: (state, { payload }) => {
        const { path, load, loading } = payload;

        state.routeData[path].load = load;
        state.routeData[path].loading = loading;
        state.load = load;
      },
    },
    setLogout: {
      // LOGOUT
      reducer: (state) => {
        state.currentActionTab = 'mainModule';
        state.activeTabs = [];
      },
      prepare: (logoutData) => ({ payload: logoutData }),
    },
  },
  extraReducers: {
    [publicSlice.actions.setAppStatus]: (state, { payload }) => {
      state.shouldUpdate = payload?.shouldUpdate || false;
    },
  },
});

export const {
  loadSaveRouter,
  createTab,
  setActiveTab,
  removeTab,
  setEndDndTab,
  setUpdate,
  openPageWithData,
  addToRouteData,
  refreshRouterData,
  refreshRouteDataItem,
  setIsLoadData,
  setLogout,
} = routerReducer.actions;

export default routerReducer.reducer;
