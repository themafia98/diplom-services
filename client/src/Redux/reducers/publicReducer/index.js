import {
  SET_ERROR,
  SET_CACHE,
  SET_STATUS,
  SHOW_GUIDE,
  UDATA_LOAD,
  CLEAR_CACHE,
  UPDATE_UDATA,
} from '../../actions/publicActions/const';

const initialState = {
  status: 'online',
  prewStatus: 'online',
  firstConnect: false,
  requestError: null,
  udata: {},
  caches: {},
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ERROR: {
      return {
        ...state,
        requestError:
          action.payload && Array.isArray(state.requestError)
            ? [...state.requestError, action.payload]
            : action.payload
            ? [action.payload]
            : null,
      };
    }

    case UDATA_LOAD: {
      const { payload = {} } = action;
      return {
        ...state,
        udata: { ...payload },
      };
    }

    case UPDATE_UDATA: {
      const { payload = {} } = action;

      return {
        ...state,
        udata: {
          ...state.udata,
          ...payload,
        },
      };
    }

    case SHOW_GUIDE: {
      return {
        ...state,
        firstConnect: action.payload,
      };
    }
    case SET_CACHE: {
      const { primaryKey } = action.payload;
      const { pk = null } = action.payload;
      const { data } = action.payload;
      const { caches = {} } = state;
      let keys = null;

      //const isObjects = typeof data === "object" && data !== null && Object.keys(data).length > 1;
      const isObjectsArray = !Object.keys(data).every(key => isNaN(Number(key)));

      const validData = isObjectsArray
        ? Object.entries(data)
            .map(([key, value]) => value)
            .filter(Boolean)
        : data;

      if (validData.length > 1) {
        keys = [];
        validData.forEach(item => {
          if (pk) {
            keys.push(`${item.depKey}${item._id}${primaryKey}${pk}`);
          } else keys.push(`${item.depKey}${item._id}${primaryKey}`);
        });

        keys = new Set(keys);
        const _items = {};

        let i = 0;
        keys.forEach(value => {
          _items[value] = { ...validData[i] };
          i += 1;
        });

        return {
          ...state,
          caches: { ..._items },
        };
      } else {
        const key = Object.keys(validData)[0];

        const depKey = validData.depKey;

        keys = !isObjectsArray
          ? `${depKey ? depKey : ''}${primaryKey}`
          : `${validData[key].depKey}${primaryKey}`;

        return {
          ...state,
          caches: { ...caches, [keys]: validData[0] ? { ...validData[0] } : validData },
        };
      }
    }

    case CLEAR_CACHE: {
      const deleteKey =
        action.payload.type === 'itemTab' ? action.payload.path.split('__')[1] : action.payload.path;
      const { caches = {} } = state || {};
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
    }

    case SET_STATUS: {
      const { statusRequst = state.status } = action.payload;
      return {
        ...state,
        status: statusRequst,
        prewStatus: state.status,
      };
    }
    default:
      return state;
  }
};
