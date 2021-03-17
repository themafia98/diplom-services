import { createSlice } from '@reduxjs/toolkit';
import { APP_STATUS } from 'App.constant';
import regExpRegister from 'Utils/Tools/regexpStorage';

const initialState = {
  appConfig: {},
  status: APP_STATUS.ON,
  prewStatus: APP_STATUS.ON,
  firstConnect: true,
  requestError: null,
  udata: {},
  caches: {},
  paramsList: [],
  settings: [],
  artifacts: [],
};

const publicSlice = createSlice({
  name: 'publicReducer',
  initialState,
  reducers: {
    loadCoreConfig: {
      // LOAD_CORE_CONFIG
      reducer: (state, { payload }) => {
        state.appConfig = payload;
      },
      prepare: (config) => ({ payload: config }),
    },
    setRequestError: {
      // SET_ERROR
      reducer: (state, { payload }) => {
        console.error(payload);

        if (payload && Array.isArray(state.requestError)) {
          state.requestError = [...state.requestError, payload];
          return;
        }

        if (payload) {
          state.requestError = payload;
          return;
        }

        state.requestError = null;
      },
      prepare: (error) => ({ payload: error }),
    },
    loadSettings: {
      // LOAD_SETTINGS
      reducer: (state, { payload }) => {
        const { settings: settingsState } = state;

        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const { type, metadata = {}, depKey } = payload;

          const parsedSettings = settingsState.map((item) => {
            const { idSettings = '', settings = [] } = item;

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

          state.settings = parsedSettings;
          return;
        }

        state.settings = payload;
      },
      prepare: (settings) => ({ payload: settings }),
    },
    loadArtifact: {
      // LOAD_ARTIFACT
      reducer: (state, { payload }) => {
        return {
          ...state,
          artifacts: payload,
        };
      },
      prepare: (artifacts) => ({ payload: artifacts }),
    },
    loadUserData: {
      // UDATA_LOAD
      reducer: (state, { payload }) => {
        state.udata = payload;
      },
      prepare: (udata) => ({ payload: udata }),
    },
    updateUserData: {
      // UPDATE_UDATA
      reducer: (state, { payload }) => {
        return {
          ...state,
          udata: {
            ...state.udata,
            ...payload,
          },
        };
      },
      prepare: (updateUdata) => ({ payload: updateUdata }),
    },
    setShowGuide: {
      // SHOW_GUIDE
      reducer: (state, { payload }) => {
        state.firstConnect = payload;
      },
      prepare: (isFirstConnect) => ({ payload: isFirstConnect }),
    },
    setAppCache: {
      // SET_CACHE
      reducer: (state, { payload }) => {
        const { uuid = 'uuid', pk = null, data, customDepKey = '', union = true } = payload;

        let keys = null;

        const isValidKeys = !Object.keys(data).every((key) => Number.isNaN(+key));

        const validData = isValidKeys
          ? Object.values(data).reduce((list, value) => {
              if (value) return [...list, value];
              return list;
            }, [])
          : data;

        if (validData.length > 1) {
          keys = new Set(
            validData.map((item) => {
              if (pk) return `${customDepKey ? customDepKey : item.depKey}${item._id}${uuid}${pk}`;
              return `${customDepKey ? customDepKey : item.depKey}${item._id}${uuid}`;
            }),
          );

          const tmp = Array.from(keys).reduce((currentTmp, value, i) => {
            const _tmp = { ...currentTmp };
            _tmp[value] = { ...validData[i] };

            return _tmp;
          }, {});

          state.caches = !union ? tmp : { ...state.caches, ...tmp };
          return;
        }

        const [key] = Object.keys(validData);
        const depKey = validData.depKey;

        let cacheKey = null;

        if (!isValidKeys) {
          cacheKey = `${customDepKey ? customDepKey : depKey ? depKey : ''}${uuid}`;
        } else {
          cacheKey = `${customDepKey ? customDepKey : validData[key].depKey}${uuid}`;
        }

        state.caches = { ...state.caches, [cacheKey]: !!validData[0] ? validData[0] : validData };
      },
      prepare: (cacheProps) => ({ payload: cacheProps }),
    },
    clearAppCache: {
      // CLEAR_CACHE
      reducer: (state, { payload }) => {
        const { type, path } = payload;

        const deleteKey = type === 'itemTab' ? path.split(regExpRegister.MODULE_ID)[1] : path;

        const filterCaches = Object.keys(state.cahces).reduce((filterObj, key) => {
          if (!key.includes(deleteKey)) {
            filterObj[key] = state.caches[key];
          }
          return filterObj;
        }, {});

        state.caches = filterCaches;
      },
      prepare: (cacheInfo) => ({ payload: cacheInfo }),
    },
    setAppStatus: {
      // SET_STATUS
      reducer: (state, { payload }) => {
        const { statusRequst = null, params = null, clearParams = false } = payload;
        let paramsListNew = [];

        if (!clearParams) {
          paramsListNew = params ? [...state.paramsList, params] : state.paramsList;
        }

        state.status = statusRequst ? statusRequst : state.status;
        state.prewStatus = state.status;
        state.paramsList = paramsListNew;
      },
    },
  },
});

export const {
  loadCoreConfig,
  setRequestError,
  loadSettings,
  loadArtifact,
  loadUserData,
  updateUserData,
  setShowGuide,
  setAppCache,
  clearAppCache,
  setAppStatus,
} = publicSlice.actions;

export default publicSlice.reducer;
