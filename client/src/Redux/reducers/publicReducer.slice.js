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

export const publicSlice = createSlice({
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
          state.requestError.push(payload);
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
        if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
          const { type, metadata = {}, depKey } = payload;

          const parsedSettings = state.settings.map((item) => {
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
        state.artifacts = payload;
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
        state.udata = {
          ...state.udata,
          ...payload,
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

          if (union) {
            const tmp = Array.from(keys).reduce((currentTmp, value, i) => {
              const _tmp = currentTmp;
              _tmp[value] = validData[i];
              return _tmp;
            }, {});
            state.caches = tmp;
            return;
          }

          Array.from(keys).forEach((value, i) => {
            state.caches[value] = validData[i];
          });
          return;
        }

        const [key] = Object.keys(validData);
        const depKey = validData.depKey;

        let cacheKey = null;
        const uniqKey = validData?.[key]?._id || '';

        if (!isValidKeys) {
          cacheKey = `${customDepKey ? customDepKey : depKey ? depKey : ''}${uuid}${uniqKey}`;
        } else {
          cacheKey = `${customDepKey ? customDepKey : validData[key].depKey}${uuid}${uniqKey}`;
        }

        state.caches[cacheKey] = !!validData[0] ? validData[0] : validData;
      },
      prepare: (cacheProps) => ({ payload: cacheProps }),
    },
    clearAppCache: {
      // CLEAR_CACHE
      reducer: (state, { payload }) => {
        const { type, path } = payload;

        const deleteKey = type === 'itemTab' ? path.split(regExpRegister.MODULE_ID)[1] : path;

        const cacheValues = state.cahces ? Object.keys(state.cahces) : null;

        if (cacheValues === null) {
          return;
        }

        const filterCaches = cacheValues.reduce((filterObj, key) => {
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

        if (!clearParams && params) {
          state.paramsList.push(params);
        }

        state.status = statusRequst ? statusRequst : state.status;
        state.prewStatus = state.status;
      },
      prepare: (appStatusConfig) => ({ payload: appStatusConfig }),
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
