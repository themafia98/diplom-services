// @ts-nocheck
import { handleActions } from 'redux-actions';
import {
  SET_ERROR,
  SET_CACHE,
  SET_STATUS,
  SHOW_GUIDE,
  UDATA_LOAD,
  CLEAR_CACHE,
  UPDATE_UDATA,
  LOAD_SETTINGS,
  LOAD_ARTIFACT,
} from '../../actions/publicActions/const';

const initialState = {
  status: 'online',
  prewStatus: 'online',
  firstConnect: true,
  requestError: null,
  udata: {},
  caches: {},
  paramsList: [],
  settings: [],
  artifacts: [],
};

export default handleActions(
  {
    [SET_ERROR]: (state, { payload }) => {
      return {
        ...state,
        requestError:
          payload && Array.isArray(state.requestError)
            ? [...state.requestError, payload]
            : payload
            ? [payload]
            : null,
      };
    },
    [LOAD_SETTINGS]: (state, { payload }) => {
      const { settings: settingsState = [] } = state;
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        const { type = '', metadata = {}, depKey = '' } = payload || {};
        const parsedSettings = settingsState.map((item) => {
          const { idSettings = '', settings = [] } = item || {};
          const isDepItem = idSettings === depKey;
          if (isDepItem && type === 'add') {
            return {
              ...item,
              settings: [...settings, { ...metadata }],
            };
          } else if (isDepItem && type === 'update') {
            return { ...metadata };
          }

          return item;
        });

        return {
          ...state,
          settings: parsedSettings,
        };
      }

      return {
        ...state,
        settings: payload,
      };
    },
    [LOAD_ARTIFACT]: (state, { payload }) => {
      return {
        ...state,
        artifacts: payload,
      };
    },
    [UDATA_LOAD]: (state, { payload }) => {
      return {
        ...state,
        udata: { ...payload },
      };
    },
    [UPDATE_UDATA]: (state, { payload }) => {
      return {
        ...state,
        udata: {
          ...state.udata,
          ...payload,
        },
      };
    },
    [SHOW_GUIDE]: (state, { payload }) => {
      return {
        ...state,
        firstConnect: payload,
      };
    },
    [SET_CACHE]: (state, { payload }) => {
      const { primaryKey, pk = null, data, customDepKey = '', union = true } = payload;
      const { caches = {} } = state;
      let keys = null;

      const isObjectsArray = !Object.keys(data).every((key) => isNaN(Number(key)));

      const validData = isObjectsArray
        ? Object.entries(data)
            .map(([key, value]) => value)
            .filter(Boolean)
        : data;

      if (validData.length > 1) {
        keys = [];
        validData.forEach((item) => {
          if (pk) {
            keys.push(`${customDepKey ? customDepKey : item.depKey}${item._id}${primaryKey}${pk}`);
          } else keys.push(`${customDepKey ? customDepKey : item.depKey}${item._id}${primaryKey}`);
        });

        keys = new Set(keys);
        const _items = {};

        let i = 0;
        keys.forEach((value) => {
          _items[value] = { ...validData[i] };
          i += 1;
        });

        return {
          ...state,
          caches: !union ? { ..._items } : { ...caches, ..._items },
        };
      } else {
        const key = Object.keys(validData)[0];

        const depKey = validData.depKey;

        keys = !isObjectsArray
          ? `${customDepKey ? customDepKey : depKey ? depKey : ''}${primaryKey}`
          : `${customDepKey ? customDepKey : validData[key].depKey}${primaryKey}`;

        return {
          ...state,
          caches: { ...caches, [keys]: validData[0] ? { ...validData[0] } : validData },
        };
      }
    },
    [CLEAR_CACHE]: (state, { payload }) => {
      const { type = '', path } = payload;
      const { caches = {} } = state || {};
      const deleteKey = type === 'itemTab' ? path.split('__')[1] : path;
      const copyCahes = { ...caches };

      const filterCaches = Object.keys(copyCahes).reduce((filterObj, key) => {
        if (!key.includes(deleteKey)) {
          filterObj[key] = copyCahes[key];
        }
        return filterObj;
      }, {});

      return {
        ...state,
        caches: filterCaches,
      };
    },
    [SET_STATUS]: (state, { payload }) => {
      const { paramsList = [], status = '' } = state;
      const { statusRequst = null, params = null, clearParams = false } = payload;
      const paramsListNew = params ? [...paramsList, params] : [...paramsList];

      return {
        ...state,
        status: statusRequst ? statusRequst : status,
        prewStatus: status,
        paramsList: clearParams ? [] : paramsListNew,
      };
    },
  },
  initialState,
);
