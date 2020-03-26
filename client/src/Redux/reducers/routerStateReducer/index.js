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
} from '../../actions/routerActions/const';
import { SET_STATUS } from '../../actions/publicActions/const';

const initialState = {
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
        currentActionTab: tab,
      };
    }

    case SET_UPDATE: {
      const { payload = {} } = action;

      return { ...state, shouldUpdate: payload };
    }
    case OPEN_PAGE_WITH_DATA: {
      const copyRouteData = { ...state.routeData };
      const { activePage = {} } = action.payload || {};

      if (
        !activePage ||
        typeof activePage !== 'object' ||
        activePage === null ||
        (activePage &&
          activePage.key !== action.payload.routeDataActive.key &&
          activePage &&
          activePage['moduleId'] &&
          activePage['moduleId'] !== 'createNews')
      ) {
        return { ...state };
      }

      const { path = '' } = action.payload.activePage || {};
      if (!path) return { ...state };

      copyRouteData[action.payload.routeDataActive.key || action.payload.routeDataActive] =
        typeof action.payload.routeDataActive !== 'string' ? action.payload.routeDataActive : {};

      return {
        ...state,
        currentActionTab: path,
        actionTabs: [...state.actionTabs, path],
        routeDataActive: { ...action.payload.routeDataActive },
        routeData: copyRouteData,
      };
    }
    case SAVE_STATE: {
      const copyRouteData = { ...state.routeData };
      const { isPartData = false, shouldUpdate = false, path = '' } = action?.payload || {};

      let pathParse = path.split('_');
      if (
        pathParse[0] === 'taskModule' &&
        pathParse[1] &&
        (pathParse[1] === 'myTasks' || pathParse[1] === 'all')
      ) {
        path = pathParse[0];
      }
      copyRouteData[path] = action.payload;
      if (action.payload.mode === 'offline') copyRouteData[path].mode = 'offlineLoading';
      else if (action.payload.mode === 'online' && copyRouteData[path].mode === 'offlineLoading') {
        delete copyRouteData[path].mode;
      }

      const isNewPartData = state?.partDataPath === null || state?.partDataPath === path;

      return {
        ...state,
        routeData: copyRouteData,
        load: action.payload.load,
        isPartData: isNewPartData ? isPartData : state.isPartData,
        partDataPath: isNewPartData ? path : state.partDataPath,
        shouldUpdate,
      };
    }

    case UPDATE_ITEM: {
      const { routeDataActive } = state;

      const updateCurrent = routeDataActive && routeDataActive._id === action.payload.id ? true : false;

      return {
        ...state,
        routeDataActive: updateCurrent
          ? { ...action.payload.updaterItem }
          : state.routeDataActive
          ? { ...state.routeDataActive }
          : {},
        routeData: {
          ...state.routeData,
          [action.payload.id]: { ...action.payload.updaterItem },
        },
      };
    }
    case SET_FLAG_LOAD_DATA: {
      const copyRouteData = { ...state.routeData };
      copyRouteData[action.payload.path].load = action.payload.load;

      return {
        ...state,
        load: action.payload.load,
        routeData: copyRouteData,
      };
    }
    case SET_ACTIVE_TAB: {
      const content = action.payload.split('__')[1];
      const selectModule = action.payload.split('_')[0];
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
      }

      return {
        ...state,
        currentActionTab: action.payload,
        routeDataActive: isDataPage ? { ...currentActive } : { ...state.routeDataActive },
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

      const indexFind = state.actionTabs.findIndex(it => it === state.currentActionTab);
      const currentFind = filterArray.findIndex(tab => tab === currentActionTab);
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
      const selectModule = nextTab.split('_')[0] || nextTab.split('__')[1] || nextTab;

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
