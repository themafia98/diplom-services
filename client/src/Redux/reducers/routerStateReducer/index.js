// @ts-nocheck
import { handleActions } from 'redux-actions';
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

export default handleActions(
  {
    [ADD_TAB]: (state, { payload }) => {
      const { pageType = '', page = '', moduleId = '', path = '' } = payload || {};
      const isString = typeof payload === 'string';

      const tab = isString ? payload : pageType === 'module' ? `${page}${moduleId}` : `${path}`;

      return {
        ...state,
        actionTabs: [...state.actionTabs, tab],
        shouldUpdate: true,
        currentActionTab: tab,
      };
    },
    [SET_UPDATE]: (state, { payload }) => {
      return { ...state, shouldUpdate: payload };
    },
    [OPEN_PAGE_WITH_DATA]: (state, { payload }) => {
      const { routeData = {}, actionTabs = [] } = state;
      const copyRouteData = { ...routeData };
      const {
        activePage = {},
        routeDataActive: RDA = {},
        routeDataActive: { key: keyRouteData = '', _id: id = '' } = {},
      } = payload || {};

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
      const isString = typeof RDA === 'string';

      const routeDataActive = !isString ? RDA : routeData[path] || {};
      copyRouteData[validKey] = !isString ? RDA : routeData[path] || {};

      return {
        ...state,
        currentActionTab,
        actionTabs: [...actionTabs, currentActionTab],
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
      const { routeData = {}, partDataPath = null } = state;
      let copyRouteData = { ...routeData };
      const {
        multiple = false,
        stateList = null,
        params: paramsAction = {},
        loading,
        shouldParseToUniq = false,
        path: pathAction = '',
        isPartData = false,
        shouldUpdate = false,
        mode = '',
        load = false,
      } = payload;

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

          const isExists = routeData[path] && routeData[path][storeName];
          if (isExists && actionItem[storeName]) {
            const currentItems = actionItem[storeName];
            const prevItems = routeData[path][storeName];

            items = shouldParseToUniq ? validationItems(currentItems, prevItems) : currentItems;
          }
          const isEmptyParams = JSON.stringify(paramsAction) === '{}' && routeData[path];
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

      copyRouteData[path] = payload;
      if (mode === 'offline') copyRouteData[path].mode = 'offlineLoading';
      else if (mode === 'online' && copyRouteData[path].mode === 'offlineLoading') {
        delete copyRouteData[path].mode;
      }
      const isNewPartData = partDataPath === null || partDataPath === path;

      let storeName = path.split('Module')[0];
      storeName = storeName[storeName.length] !== 's' ? `${storeName}s` : storeName;

      if (copyRouteData[path][storeName] && routeData[path] && routeData[path][storeName]) {
        const currenItems = copyRouteData[path][storeName];
        const prevItems = routeData[path][storeName];

        const items = shouldParseToUniq
          ? validationItems(currenItems, prevItems)
          : copyRouteData[path][storeName];

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
      const currentStateData = routeData[path] ? { ...payload, ...routeData[path], shouldUpdate: false } : {};
      copyRouteData[path] = {
        ...currentStateData,
        ...payload,
        shouldUpdate: false,
        loading,
      };
      if (path) {
        return {
          ...state,
          path,
          routeData: copyRouteData,
          load,
          isPartData: isNewPartData ? isPartData : state.isPartData,
          partDataPath: isNewPartData ? path : state.partDataPath,
          shouldUpdate,
        };
      } else return state;
    },
    [UPDATE_ITEM]: (state, { payload }) => {
      const { routeDataActive, currentActionTab = '', routeData = {}, path = '' } = state;
      const { id, updateBy = '_id', updaterItem = {}, store = path.split('__')[0] } = payload;

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
      const copyRouteData = { ...routeData };
      const { path, load, loading } = payload;

      return {
        ...state,
        load,
        routeData: {
          ...routeData,
          ...copyRouteData,
          [path]: {
            ...copyRouteData[path],
            load,
            loading,
          },
        },
      };
    },
    [SET_ACTIVE_TAB]: (state, { payload }) => {
      const { routeData: routeDataState = {}, routeDataActive = {} } = state;
      const content = payload.split('__')[1];
      const selectModule = payload;
      let currentActive = null;
      let isDataPage = false;
      if (content) {
        isDataPage = true;
        currentActive = routeDataState[content];
      }
      const searchPathContent = selectModule || payload || content;

      let shouldUpdate = false;
      const searchPath = searchPathContent === 'statisticModule' ? 'taskModule' : searchPathContent;

      if (payload === 'contactModule_feedback') {
        shouldUpdate = true;
      } else if (routeDataState[searchPath]) {
        shouldUpdate = true;
      } else if (payload.includes('settings')) {
        shouldUpdate = true;
      } else if (payload.includes('customersModule_contacts')) {
        shouldUpdate = true;
      } else if (routeDataState['statisticModule']) {
        shouldUpdate = true;
      }

      const isExistModule = routeDataState[selectModule] || null;

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
            },
          }
        : { ...routeDataState };

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
    [SET_STATUS]: (state, { payload }) => {
      const { shouldUpdate = false } = payload;
      return {
        ...state,
        shouldUpdate,
      };
    },
    [REMOVE_TAB]: (state, { payload }) => {
      const { type = '', path = '' } = payload;
      const {
        routeData = {},
        currentActionTab = '',
        actionTabs = [],
        routeDataActive = {},
        routeDataActive: { key = '' } = {},
      } = state;

      let deleteKey = type === 'itemTab' ? path.split('__')[1] : path;
      let deleteKeyOnce = !deleteKey ? path : null;

      const filterArray = actionTabs.filter((tab, i) => {
        if (
          deleteKey &&
          ((type === 'itemTab' && tab.includes(path.split('__')[1]) && path.split('__')[1] === deleteKey) ||
            (!tab.split('__')[1] && tab.includes(path)))
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

      const indexFind = actionTabs.findIndex((it) => it === currentActionTab);
      const currentFind = filterArray.findIndex((tab) => tab === currentActionTab);
      const nextTab = currentFind !== -1 ? currentActionTab : filterArray[indexFind - 1];

      const uuid = typeof nextTab === 'string' && type === 'itemTab' ? nextTab.split('__')[1] : nextTab;

      const copyData = routeDataNew;
      let current = null;

      const isSimple =
        copyData[nextTab.split('__')[1]] && copyData[nextTab.split('__')[1]].key === nextTab.split('__')[1];

      const isDelete = routeDataActive && deleteKey === routeDataActive && uuid && !deleteKeyOnce;

      const isNext = routeDataActive && nextTab.split('__')[1] && key === nextTab.split('__')[1];

      current = isSimple
        ? { ...copyData[nextTab.split('__')[1]] }
        : isDelete
        ? routeDataNew[uuid]
        : isNext
        ? { ...routeDataActive }
        : {};

      const selectModule = nextTab ? nextTab || nextTab.split('__')[1] || nextTab : nextTab;

      return {
        ...state,
        currentActionTab: nextTab || 'mainModule',
        actionTabs: filterArray,
        routeDataActive: current,
        routeData: copyData,
        shouldUpdate: !routeData[selectModule] ? false : true,
      };
    },
    [LOGOUT]: (state) => {
      return {
        ...state,
        currentActionTab: 'mainModule',
        actionTabs: [],
      };
    },
  },
  initialState,
);
