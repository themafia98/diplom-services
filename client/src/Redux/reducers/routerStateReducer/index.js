import { handleActions } from 'redux-actions';
import {
  ADD_TAB,
  SET_ACTIVE_TAB,
  REMOVE_TAB,
  LOGOUT,
  OPEN_PAGE_WITH_DATA,
  SAVE_STATE,
  SET_FLAG_LOAD_DATA,
  UPDATE_ITEM,
  SET_UPDATE,
  ADD_TO_ROUTE_DATA,
  LOAD_SAVE_ROUTER,
} from 'Redux/actions/routerActions/const';
import { ON_END_DRAG_TAB } from 'Redux/actions/tabActions/const';
import { SET_STATUS } from 'Redux/actions/publicActions/const';
import regExpRegister from 'Utils/Tools/regexpStorage';

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

export default handleActions(
  {
    [LOAD_SAVE_ROUTER]: (state, { payload }) => {
      const { activeTabs = [], path = '' } = payload || {};

      let normalizeRoute = {
        ...state,
        ...payload,
      };

      if (!activeTabs.includes('mainModule')) {
        normalizeRoute = {
          ...normalizeRoute,
          activeTabs: [...normalizeRoute.activeTabs, 'mainModule'],
        };
      }

      if (!path) {
        normalizeRoute = {
          ...normalizeRoute,
          path: 'mainModule',
        };
      }

      return normalizeRoute;
    },
    [ADD_TAB]: (state, { payload }) => {
      const { activeTabs = [], routeData = {} } = state;
      const { tab: { path: configPath = '' } = {}, path: pathDefault = '', config = {} } = payload || {};

      const withConfig = config && !!Object.keys(config).length;
      const isString = typeof payload === 'string';

      const path = withConfig ? configPath : pathDefault;
      const tab = isString ? payload : path;

      const newRouteData = withConfig
        ? {
            ...routeData,
            [path]: { config: { ...config } },
          }
        : routeData;

      return {
        ...state,
        path: tab && !path ? tab : path,
        activeTabs: [...activeTabs, tab],
        shouldUpdate: true,
        currentActionTab: tab,
        routeData: newRouteData,
      };
    },
    [SET_ACTIVE_TAB]: (state, { payload: draftPayload }) => {
      const { routeData: routeDataState = {}, routeDataActive = {} } = state;
      const withConfig = draftPayload && typeof draftPayload === 'object' && !!draftPayload?.config;
      const { config: { hardCodeUpdate = true } = {}, tab: tabWithConfig = '', config = {} } = withConfig
        ? draftPayload
        : {};

      const payload = withConfig
        ? tabWithConfig
        : typeof draftPayload === 'string'
        ? draftPayload
        : draftPayload?.tab;
      const content =
        typeof payload === 'string'
          ? payload?.split(regExpRegister.MODULE_ID)[1]
          : draftPayload?.tab?.split(regExpRegister.MODULE_ID)[1];

      const selectModule = payload;
      let currentActive = null;
      let isDataPage = false;

      if (content || withConfig) {
        isDataPage = true;
        currentActive = withConfig && !content ? { config } : routeDataState[content];
      }

      const isExistModule = routeDataState[selectModule] || null;
      const { config: { hardCodeUpdate: updater } = {} } = isExistModule ? routeDataState[selectModule] : {};

      const existModuleProps = isExistModule
        ? {
            ...routeDataState[selectModule],
            load: false,
          }
        : {};

      const routeData = isExistModule
        ? {
            ...routeDataState,
            [selectModule]: {
              ...routeDataState[selectModule],
              ...existModuleProps,
              hardCodeUpdate: hardCodeUpdate ? !!payload : null,
            },
          }
        : { ...routeDataState };
      const shouldUpdate = updater || (updater === undefined && hardCodeUpdate);
      return {
        ...state,
        path: payload,
        currentActionTab: payload,
        routeDataActive: isDataPage
          ? { ...currentActive }
          : { ...routeDataState[selectModule], ...routeDataActive },
        routeData,
        shouldUpdate,
      };
    },
    [REMOVE_TAB]: (state, { payload }) => {
      const { type = '', path = '' } = payload;
      const {
        routeData = {},
        currentActionTab = '',
        activeTabs = [],
        routeDataActive = {},
        routeDataActive: { _id: id = '' } = {},
      } = state;

      const entityId = path.split(regExpRegister.MODULE_ID)[1];
      let deleteKey = type === 'itemTab' ? entityId : path;
      let deleteKeyOnce = !deleteKey ? path : null;

      const filterArray = activeTabs.filter((tab, i) => {
        if (
          deleteKey &&
          ((type === 'itemTab' && tab.includes(entityId) && entityId === deleteKey) ||
            (!tab.split(regExpRegister.MODULE_ID)[1] && tab.includes(path)))
        )
          return false;
        return tab !== payload;
      });

      const keys = Object.keys(routeData);
      const routeDataNew = {};

      for (let i = 0; i < keys.length; i++) {
        if ((type === 'itemTab' && routeData[keys[i]].key !== deleteKey) || !keys[i].includes(deleteKey)) {
          routeDataNew[keys[i]] = { ...routeData[keys[i]] };
        }
      }

      const indexFind = activeTabs.findIndex((it) => it === currentActionTab);
      const currentFind = filterArray.findIndex((tab) => tab === currentActionTab);
      let nextTab = null;

      if (currentFind !== -1) nextTab = currentActionTab;
      else if (indexFind === 0) nextTab = filterArray[indexFind];
      else nextTab = filterArray[indexFind - 1];

      const parsedTabEntity = nextTab?.split(regExpRegister.MODULE_ID)?.[1];
      const uuidEntityItem = typeof nextTab === 'string' && type === 'itemTab' ? parsedTabEntity : nextTab;

      const copyData = routeDataNew;
      let current = null;

      if (!nextTab) {
        console.warn('Next tab not found');
        return state;
      }
      const { [parsedTabEntity]: tabItem = {} } = copyData || {};
      const { _id: tabId = '' } = tabItem || {};

      const isSimple = copyData[parsedTabEntity] && tabId === parsedTabEntity;

      const isDelete = routeDataActive && uuidEntityItem && !deleteKeyOnce;
      const isNext = routeDataActive && parsedTabEntity && id === parsedTabEntity;

      current = isSimple
        ? { ...copyData[parsedTabEntity] }
        : isDelete && uuidEntityItem && routeDataNew[uuidEntityItem]
        ? routeDataNew[uuidEntityItem]
        : isNext
        ? { ...routeDataActive }
        : {};

      const selectModule = nextTab ? nextTab || parsedTabEntity || nextTab : nextTab;

      return {
        ...state,
        currentActionTab: nextTab || 'mainModule',
        activeTabs: filterArray,
        routeDataActive: current || {},
        routeData: copyData,
        shouldUpdate: !routeData[selectModule] ? false : true,
      };
    },
    [ON_END_DRAG_TAB]: (state, { payload = [] }) => {
      return {
        ...state,
        activeTabs: payload.map(({ EUID = '' }) => EUID),
      };
    },
    [SET_UPDATE]: (state, { payload }) => {
      return { ...state, shouldUpdate: payload };
    },
    [OPEN_PAGE_WITH_DATA]: (state, { payload }) => {
      const { routeData = {}, activeTabs = [] } = state;

      const copyRouteData = { ...routeData };
      const { activePage = {}, routeDataActive: RDA = {} } = payload || {};
      const { key: keyRouteData = '', _id: id = '' } = RDA;
      const { from = 'default', moduleId = '' } = activePage;
      const isLinkRedirect = moduleId === '$link$';

      const isAccessRedirect = isLinkRedirect || activePage?.key === keyRouteData;
      const isStrictEqaulEntity = activePage?.key === id;

      const isEmptyActivePage = !activePage || typeof activePage !== 'object';
      const isEqualKeys = (activePage && isAccessRedirect) || isStrictEqaulEntity;

      if (isEmptyActivePage || (!isEqualKeys && moduleId)) {
        return { ...state };
      }

      const { path: pathPage = '' } = activePage || {};

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

      if (!pathPage) return { ...state };

      const validKey = id || keyRouteData || 'undefiendModule';
      const isString = typeof RDA === 'string';

      const routeDataActive = !isString
        ? { ...RDA, from }
        : routeData[pathPage]
        ? { ...routeData[pathPage], from }
        : {};

      copyRouteData[validKey] = !isString
        ? { ...RDA, from }
        : routeData[pathPage]
        ? { ...routeData[pathPage], from }
        : {};

      return {
        ...state,
        currentActionTab,
        activeTabs: [...activeTabs, currentActionTab],
        routeDataActive: { ...routeDataActive },
        routeData: copyRouteData,
      };
    },
    [ADD_TO_ROUTE_DATA]: (state, { payload }) => {
      const { path, saveData = {}, loading } = payload;
      const { routeData = {} } = state;
      const savedCurrentData = routeData[path]
        ? {
            ...routeData[path],
          }
        : {};
      const shouldUpdate = loading !== undefined ? loading : routeData[path]?.loading;
      return {
        ...state,
        routeData: {
          ...state.routeData,
          [path]: {
            ...savedCurrentData,
            saveData: { ...saveData },
            loading: shouldUpdate,
            shouldUpdate,
          },
        },
      };
    },
    [SAVE_STATE]: (state, { payload }) => {
      const { routeData = {} } = state;
      let copyRouteData = { ...routeData };
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

          const isEmptyParams = JSON.stringify(paramsAction) === '{}' && !!routeData[path];
          const params = isEmptyParams ? routeData[path]?.params : paramsAction;
          const currentStateData = routeData[path] ? { ...routeData[path] } : {};

          if (path)
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
          else return newState;
        }, {});

        const shouldUpdateList = Object.keys(routeData).every((key) => {
          if (stateList.some((actionItem) => actionItem?.path && key === actionItem.path)) {
            return routeData[key]?.load;
          }
          return true;
        });

        if (shouldUpdateList) {
          return {
            ...state,
            routeData: {
              ...routeData,
              ...modulesState,
            },
          };
        }
      }

      copyRouteData[path] = { ...payload };

      let storeName = path.split(regExpRegister.INCLUDE_MODULE)[0];
      storeName = storeName[storeName.length] !== 's' ? `${storeName}s` : storeName;

      if (path.includes('#private')) {
        storeName = 'streamList';
      }

      if (copyRouteData[path][storeName] && routeData[path] && routeData[path][storeName]) {
        const items = copyRouteData[path][storeName];
        const currentStateData = routeData[path] ? { ...routeData[path] } : {};

        copyRouteData = {
          ...copyRouteData,
          [path]: {
            ...currentStateData,
            ...copyRouteData[path],
            shouldUpdate: false,
            load: true,
            loading,
            [storeName]: items,
          },
        };
      }

      if (storeName.includes('cabinet')) {
        storeName = 'users';
      }

      const addItem = add && payload[storeName] ? { ...payload[storeName] } : null;
      let currentStateData = {};
      let normalizeRouteData = null;
      if (routeData[path]) currentStateData = { ...routeData[path], shouldUpdate: false };

      if (add && addItem && addItem?._id) normalizeRouteData = { [addItem._id]: addItem };

      const additionalList =
        add && addItem
          ? {
              [storeName]: [addItem],
            }
          : {};
      const routeDataActive = addItem ? { ...addItem } : state.routeDataActive;

      copyRouteData[path] = {
        ...currentStateData,
        ...payload,
        ...additionalList,
        shouldUpdate: false,
        loading,
      };

      if (normalizeRouteData && addItem && addItem?._id) {
        copyRouteData[addItem._id] = {
          ...addItem,
        };
      }

      if (path) {
        return {
          ...state,
          path,
          routeData: copyRouteData,
          load,
          shouldUpdate,
          routeDataActive,
        };
      } else return state;
    },
    [UPDATE_ITEM]: (state, { payload }) => {
      const { routeDataActive, routeData = {}, path: currentPath = '' } = state;
      const {
        id,
        updateBy = '_id',
        updaterItem = {},
        store = currentPath.split(regExpRegister.MODULE_ID)[0],
        parsedRoutePath = {},
      } = payload;
      const { itemId = '', path = '' } = parsedRoutePath || {};

      const isExist = routeDataActive && routeDataActive[updateBy];
      const currentModule = path.split(regExpRegister.MODULE_ID);

      if (!path || !currentModule) return state;

      const [moduleName = '', entityId = ''] = currentModule || [];
      const itemName = moduleName && entityId ? entityId : moduleName;

      const { [store]: dataArray = [], ...data } =
        !itemId && routeData[currentModule[0]]
          ? routeData[itemName]
          : currentModule[1] && itemId && routeData[itemId]
          ? routeData[itemId]
          : {};

      const dataList = Array.isArray(dataArray) && dataArray?.length ? dataArray : data;

      const updateCurrent = isExist && routeDataActive[updateBy] === id ? true : false;

      const newStore =
        Array.isArray(dataList) && dataList?.length
          ? dataList.map((item) => {
              if (item[updateBy] && item[updateBy] !== id) return item;
              const isObject = updaterItem && typeof updaterItem === 'object';
              return isObject
                ? {
                    ...updaterItem,
                  }
                : updaterItem;
            })
          : dataList;

      const updateCurrentModule = dataList
        ? {
            [itemName]: {
              ...routeData[itemName],
              [store]:
                Array.isArray(newStore) && newStore?.length
                  ? newStore
                  : !!routeData[itemName][store]
                  ? [...Array.from(routeData[currentModule][store]), newStore]
                  : [newStore],
            },
          }
        : {};

      return {
        ...state,
        routeDataActive: updateCurrent
          ? { ...updaterItem }
          : state.routeDataActive
          ? { ...state.routeDataActive }
          : {},
        routeData: {
          ...state.routeData,
          ...updateCurrentModule,
          [id]: { ...updaterItem },
        },
      };
    },
    [SET_FLAG_LOAD_DATA]: (state, { payload }) => {
      const { routeData = {} } = state;
      const { path, load, loading } = payload;

      const newModuleData = {
        [path]: {
          ...routeData[path],
          load,
          loading,
        },
      };

      return {
        ...state,
        load,
        routeData: {
          ...routeData,
          ...newModuleData,
        },
      };
    },
    [SET_STATUS]: (state, { payload }) => {
      const { shouldUpdate = false } = payload;
      return {
        ...state,
        shouldUpdate,
      };
    },
    [LOGOUT]: (state) => {
      return {
        ...state,
        currentActionTab: 'mainModule',
        activeTabs: [],
      };
    },
  },
  initialState,
);
