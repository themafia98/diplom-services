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
} from 'Redux/actions/routerActions/const';
import { ON_END_DRAG_TAB } from 'Redux/actions/tabActions/const';
import { SET_STATUS } from 'Redux/actions/publicActions/const';

const initialState = {
  path: null,
  currentActionTab: 'mainModule',
  actionTabs: [],
  routeDataActive: {},
  routeData: {},
  load: false,
  partDataPath: null,
  shouldUpdate: false,
};

export default handleActions(
  {
    [ADD_TAB]: (state, { payload }) => {
      const { actionTabs = [], routeData = {} } = state;
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
        actionTabs: [...actionTabs, tab],
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
        typeof payload === 'string' ? payload?.split('__')[1] : draftPayload?.tab?.split('__')[1];

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
      let nextTab = null;

      if (currentFind !== -1) nextTab = currentActionTab;
      else if (indexFind === 0) nextTab = filterArray[indexFind];
      else nextTab = filterArray[indexFind - 1];

      const uuid = typeof nextTab === 'string' && type === 'itemTab' ? nextTab.split('__')[1] : nextTab;

      const copyData = routeDataNew;
      let current = null;

      if (!nextTab) {
        console.warn('Next tab not found');
        return state;
      }

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
    [ON_END_DRAG_TAB]: (state, { payload = [] }) => {
      return {
        ...state,
        actionTabs: payload.map(({ EUID = '' }) => EUID),
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

      const isEmptyActivePage = !activePage || typeof activePage !== 'object';
      const isEqualKeys = (activePage && activePage?.key === keyRouteData) || activePage?.key === id;
      const isValidModuleId = activePage && activePage?.moduleId;

      if (isEmptyActivePage || (!isEqualKeys && isValidModuleId)) {
        return { ...state };
      }

      const { path: pathPage = '' } = activePage || {};

      const linkEntity = pathPage.includes('___link') && pathPage.split('__')[1];
      let currentActionTab = pathPage;

      if (linkEntity) {
        const pathLink = linkEntity ? pathPage.split('___link')[0] : pathPage;
        const moduleName = pathLink.split('#')[0];
        currentActionTab = `${moduleName}__${linkEntity}`;
      }

      if (!pathPage) return { ...state };

      const validKey = id || keyRouteData || 'undefiendModule';
      const isString = typeof RDA === 'string';

      const routeDataActive = !isString ? RDA : routeData[pathPage] || {};
      copyRouteData[validKey] = !isString ? RDA : routeData[pathPage] || {};

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

      let storeName = path.split('Module')[0];
      storeName = storeName[storeName.length] !== 's' ? `${storeName}s` : storeName;

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
      const currentStateData = routeData[path] ? { ...routeData[path], shouldUpdate: false } : {};
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
          shouldUpdate,
        };
      } else return state;
    },
    [UPDATE_ITEM]: (state, { payload }) => {
      const { routeDataActive, currentActionTab = '', routeData = {}, path = '' } = state;
      const { id, updateBy = '_id', updaterItem = {}, store = path.split('__')[0] } = payload;

      const isExist = routeDataActive && routeDataActive[updateBy];
      const currentModule = currentActionTab.split('__')[0];

      const isExistModule = !!routeData[currentModule];
      const isExistStore = isExistModule ? !!routeData[currentModule][store] : null;

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
        actionTabs: [],
      };
    },
  },
  initialState,
);
