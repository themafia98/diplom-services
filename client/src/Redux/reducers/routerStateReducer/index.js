// @ts-nocheck
import _ from 'lodash';
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
} from 'Redux/actions/routerActions/const';
import { validationItems } from 'Utils';
import { SET_STATUS } from 'Redux/actions/publicActions/const';

const initialState = {
  path: null,
  currentActionTab: 'mainModule',
  actionTabs: [],
  routeDataActive: {},
  routeData: {},
  load: false,
  isPartData: false,
  partDataPath: null,
  shouldUpdate: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case ADD_TAB: {
      const isString = typeof action.payload === 'string';

      const tab = isString
        ? action.payload
        : action.payload.pageType === 'module'
        ? `${action.payload.page}${action.payload.moduleId}`
        : `${action.payload.path}`;

      return {
        ...state,
        actionTabs: [...state.actionTabs, tab],
        shouldUpdate: true,
        currentActionTab: tab,
      };
    }

    case SET_UPDATE: {
      const { payload = {} } = action;

      return { ...state, shouldUpdate: payload };
    }
    case OPEN_PAGE_WITH_DATA: {
      const copyRouteData = { ...state.routeData };
      const {
        activePage = {},
        routeDataActive: RDA = {},
        routeDataActive: { key: keyRouteData = '', _id: id = '' } = {},
      } = action.payload || {};

      const isEmptyActivePage = !activePage || !_.isPlainObject(activePage);
      const isEqualKeys = (activePage && activePage?.key === keyRouteData) || activePage?.key === id;
      const isValidModuleId = activePage && activePage?.moduleId && activePage?.moduleId !== 'createNews';

      if (isEmptyActivePage || (!isEqualKeys && isValidModuleId)) {
        return { ...state };
      }

      const { path: pathPage = '' } = activePage || {};

      const linkEntity = pathPage.includes('___link') && pathPage.split('__')[1];
      let path = pathPage;
      let currentActionTab = path;

      if (linkEntity) {
        const pathLink = linkEntity ? pathPage.split('___link')[0] : pathPage;
        const moduleName = pathLink.split('#')[0];
        currentActionTab = `${moduleName}__${linkEntity}`;
      }

      if (!path) return { ...state };

      const validKey = keyRouteData || id || 'undefiendModule';
      const routeDataActive = !_.isString(RDA) ? RDA : state.routeData[path] || {};
      copyRouteData[validKey] = !_.isString(RDA) ? RDA : state.routeData[path] || {};

      return {
        ...state,
        currentActionTab,
        actionTabs: [...state.actionTabs, currentActionTab],
        routeDataActive: { ...routeDataActive },
        routeData: copyRouteData,
      };
    }

    case ADD_TO_ROUTE_DATA: {
      const { path, saveData = {}, loading } = action.payload;
      const savedCurrentData = state.routeData[path]
        ? {
            ...state.routeData[path],
          }
        : {};
      const shouldUpdate = loading !== undefined ? loading : state.routeData[path]?.loading;
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
    }
    case SAVE_STATE: {
      let copyRouteData = { ...state.routeData };
      const {
        multiple = false,
        stateList = null,
        params: paramsAction = {},
        loading,
        shouldParseToUniq = false,
        path: pathAction = '',
        isPartData = false,
        shouldUpdate = false,
      } = action?.payload;

      const isLink = pathAction.includes('__link') && pathAction.split('__')[1];
      const pathLink = isLink ? pathAction.split('__')[1] : pathAction;
      const path = pathLink.split('__link')[0];

      if (stateList && Array.isArray(stateList) && multiple) {
        const modulesState = stateList.reduce((newState, actionItem) => {
          const { path = '' } = actionItem;

          let storeName = path ? path.split('Module')[0] : '';
          storeName = storeName[storeName.length] !== 's' ? `${storeName}s` : storeName;
          if (!storeName) return newState;
          let items = actionItem[storeName];

          if (!actionItem[storeName] && storeName.includes('contact')) {
            items = actionItem['news'];
          }

          const isExists = state.routeData[path] && state.routeData[path][storeName];
          if (isExists && actionItem[storeName]) {
            const currentItems = actionItem[storeName];
            const prevItems = state.routeData[path][storeName];

            items = shouldParseToUniq ? validationItems(currentItems, prevItems) : currentItems;
          }
          const isEmptyParams = JSON.stringify(paramsAction) === '{}' && state.routeData[path];
          const params = isEmptyParams ? state.routeData[path]?.params : paramsAction;
          const currentStateData = state.routeData[path] ? { ...state.routeData[path] } : {};

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

        const shouldUpdateList = Object.keys(state.routeData).every((key) => {
          if (stateList.some((actionItem) => actionItem?.path && key === actionItem.path)) {
            return state.routeData[key]?.load;
          }
          return true;
        });

        if (shouldUpdateList) {
          return {
            ...state,
            routeData: {
              ...state.routeData,
              ...modulesState,
            },
          };
        }
      }

      copyRouteData[path] = action.payload;
      if (action.payload.mode === 'offline') copyRouteData[path].mode = 'offlineLoading';
      else if (action.payload.mode === 'online' && copyRouteData[path].mode === 'offlineLoading') {
        delete copyRouteData[path].mode;
      }
      const isNewPartData = state?.partDataPath === null || state?.partDataPath === path;

      let storeName = path.split('Module')[0];
      storeName = storeName[storeName.length] !== 's' ? `${storeName}s` : storeName;

      if (copyRouteData[path][storeName] && state.routeData[path] && state.routeData[path][storeName]) {
        const currenItems = copyRouteData[path][storeName];
        const prevItems = state.routeData[path][storeName];

        const items = shouldParseToUniq
          ? validationItems(currenItems, prevItems)
          : copyRouteData[path][storeName];

        const currentStateData = state.routeData[path] ? { ...state.routeData[path] } : {};

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
      const currentStateData = state.routeData[path]
        ? { ...action.payload, ...state.routeData[path], shouldUpdate: false }
        : {};
      copyRouteData[path] = {
        ...currentStateData,
        ...action.payload,
        shouldUpdate: false,
        loading,
      };
      if (path)
        return {
          ...state,
          path,
          routeData: copyRouteData,
          load: action.payload.load,
          isPartData: isNewPartData ? isPartData : state.isPartData,
          partDataPath: isNewPartData ? path : state.partDataPath,
          shouldUpdate,
        };
      else return state;
    }

    case UPDATE_ITEM: {
      const { routeDataActive, currentActionTab = '', routeData = {} } = state;
      const { id, updateBy = '_id', updaterItem = {}, store = state?.path.split('__')[0] } = action.payload;

      const isExist = routeDataActive && routeDataActive[updateBy];
      const currentModule = currentActionTab.split('__')[0];

      const isExistModule = Boolean(routeData[currentModule]);
      const isExistStore = isExistModule ? Boolean(routeData[currentModule][store]) : null;

      const updateCurrent = isExist && routeDataActive[updateBy] === id ? true : false;
      const dataList = isExistStore && isExistModule ? routeData[currentModule][store] : [];

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
          : null;

      const updateCurrentModule =
        newStore && newStore.length
          ? {
              [currentModule]: {
                ...routeData[currentModule],
                [store]: newStore,
              },
            }
          : {};

      return {
        ...state,
        routeDataActive: updateCurrent
          ? { ...action.payload.updaterItem }
          : state.routeDataActive
          ? { ...state.routeDataActive }
          : {},
        routeData: {
          ...state.routeData,
          ...updateCurrentModule,
          [action.payload.id]: { ...action.payload.updaterItem },
        },
      };
    }
    case SET_FLAG_LOAD_DATA: {
      const copyRouteData = { ...state.routeData };
      const { path, load, loading } = action.payload;

      return {
        ...state,
        load: action.payload.load,
        routeData: {
          ...state.routeData,
          ...copyRouteData,
          [path]: {
            ...copyRouteData[path],
            load,
            loading,
          },
        },
      };
    }
    case SET_ACTIVE_TAB: {
      const content = action.payload.split('__')[1];
      const selectModule = action.payload;
      let currentActive = null;
      let isDataPage = false;
      if (content) {
        isDataPage = true;
        currentActive = state.routeData[content];
      }
      const searchPathContent = selectModule || action.payload || content;

      let shouldUpdate = false;
      const searchPath = searchPathContent === 'statisticModule' ? 'taskModule' : searchPathContent;

      if (action.payload === 'contactModule_feedback') {
        shouldUpdate = true;
      } else if (state.routeData[searchPath]) {
        shouldUpdate = true;
      } else if (action.payload.includes('settings')) {
        shouldUpdate = true;
      } else if (action.payload.includes('customersModule_contacts')) {
        shouldUpdate = true;
      } else if (state.routeData['statisticModule']) {
        shouldUpdate = true;
      }

      const isExistModule = state.routeData[selectModule] || null;

      const existModuleProps = isExistModule
        ? {
            ...state.routeData[selectModule],
            load: false,
          }
        : {};

      const routeData = isExistModule
        ? {
            ...state.routeData,
            [selectModule]: {
              ...state.routeData[selectModule],
              ...existModuleProps,
            },
          }
        : { ...state.routeData };

      return {
        ...state,
        path: action.payload,
        currentActionTab: action.payload,
        routeDataActive: isDataPage
          ? { ...currentActive }
          : { ...state.routeData[selectModule], ...state.routeDataActive },
        routeData,
        shouldUpdate,
      };
    }
    case SET_STATUS: {
      const { shouldUpdate = false } = action.payload;

      return {
        ...state,
        shouldUpdate: shouldUpdate,
      };
    }
    case REMOVE_TAB: {
      let deleteKey =
        action.payload.type === 'itemTab' ? action.payload.path.split('__')[1] : action.payload.path;
      const { currentActionTab } = state;

      let deleteKeyOnce = !deleteKey ? action.payload.path : null;
      const filterArray = state.actionTabs.filter((tab, i) => {
        if (
          deleteKey &&
          ((action.payload.type === 'itemTab' &&
            tab.includes(action.payload.path.split('__')[1]) &&
            action.payload.path.split('__')[1] === deleteKey) ||
            (!tab.split('__')[1] && tab.includes(action.payload.path)))
        )
          return false;
        return tab !== action.payload;
      });

      const keys = Object.keys(state.routeData);
      const routeDataNew = {};

      for (let i = 0; i < keys.length; i++) {
        if (
          (action.payload.type === 'itemTab' && state.routeData[keys[i]].key !== deleteKey) ||
          !keys[i].includes(deleteKey)
        ) {
          routeDataNew[keys[i]] = { ...state.routeData[keys[i]] };
        }
      }

      const indexFind = state.actionTabs.findIndex((it) => it === state.currentActionTab);
      const currentFind = filterArray.findIndex((tab) => tab === currentActionTab);
      const nextTab = currentFind !== -1 ? currentActionTab : filterArray[indexFind - 1];

      const uuid =
        typeof nextTab === 'string' && action.payload.type === 'itemTab' ? nextTab.split('__')[1] : nextTab;

      const copyData = routeDataNew;
      let current = null;
      try {
        const isSimple =
          copyData[nextTab.split('__')[1]] && copyData[nextTab.split('__')[1]].key === nextTab.split('__')[1];

        const isDelete =
          state.routeDataActive && deleteKey === state.routeDataActive.key && uuid && !deleteKeyOnce;

        const isNext =
          state.routeDataActive &&
          nextTab.split('__')[1] &&
          state.routeDataActive.key === nextTab.split('__')[1];

        current = isSimple
          ? { ...copyData[nextTab.split('__')[1]] }
          : isDelete
          ? routeDataNew[uuid]
          : isNext
          ? { ...state.routeDataActive }
          : {};
      } catch {
        current = {};
      }
      const selectModule = nextTab ? nextTab || nextTab.split('__')[1] || nextTab : nextTab;

      return {
        ...state,
        currentActionTab: nextTab || 'mainModule',
        actionTabs: filterArray,
        routeDataActive: current,
        routeData: copyData,
        shouldUpdate: !state.routeData[selectModule] ? false : true,
      };
    }
    case LOGOUT: {
      return {
        ...state,
        currentActionTab: 'mainModule',
        actionTabs: [],
      };
    }
    default:
      return state;
  }
};
