import reduxCoreThunk from 'Redux/core';
import { multipleLoadData } from './routerReducer.thunk';
import actionsTypes from 'actions.types';
import { requestTemplate, paramsTemplate } from 'Utils/Api/api.utils';
import { message } from 'antd';
import {
  loadArtifact,
  loadSettings,
  setAppCache,
  setAppStatus,
  setRequestError,
} from 'Redux/reducers/publicReducer.slice';
import { refreshRouteDataItem } from 'Redux/reducers/routerReducer.slice';

const { errorThunk, cachingThunk, getterCacheThunk, putterCacheThunk, updateEntityThunk } = reduxCoreThunk;

/**
 * Middleware
 * @param {object} props
 * @param {object} schema - validator
 * @param {Function} Request - http requests
 * @param {object} clientDB - IndexedDB methods
 */

const middlewareCaching = ({
  actionType = '',
  item = {},
  depKey = '',
  depStore = '',
  store = '',
  uid = '',
  type = '',
  updateBy = '_id',
  clientDB = null,
}) => async (dispatch, getState, { schema, Request }) => {
  const rest = new Request();

  const depActions = {
    setRequestError,
    setAppCache,
  };

  try {
    if (actionType?.includes('__get')) {
      /** caching items middleware */

      const path = `/${depStore}/caching/jurnal`;
      const body = {
        ...requestTemplate,
        actionType: actionsTypes.$CACHING_JURNAL,
        params: {
          ...paramsTemplate,
          options: { depKey, depStore },
          item,
        },
      };

      const res = await rest.sendRequest(path, 'PUT', body, true);
      const [items, error] = rest.parseResponse(res);
      const { dataItems = null } = items;

      if (error) throw new Error(error);

      const dep = {
        store,
        actionType,
        clientDB,
        schema,
        dataItems,
        updateBy,
        multipleLoadData,
      };

      await cachingThunk(dispatch, dep, depActions);
      return;
    }

    /** default middleware function */
    const dep = {
      depStore,
      item,
      type,
      actionType,
      uid,
      Request,
      multipleLoadData,
    };

    await putterCacheThunk(dispatch, dep, depActions);
  } catch (error) {
    const depError = {
      depStore,
      depKey,
      item,
      store,
      actionType,
      clientDB,
      schema,
      Request,
      setRequestError,
      setAppStatus,
      multipleLoadData,
      rest,
    };
    console.error(error);
    errorThunk(error, dispatch, depError);
  }
};

const loadCacheData = ({
  actionType = '', // key
  depKey = '',
  depStore = '',
  store = '',
  updateBy = '_id',
  clientDB = null,
}) => async (dispatch, getState, { schema, Request }) => {
  const rest = new Request();
  const depActions = {
    setRequestError,
    setAppCache,
  };

  try {
    const path = `/${depStore}/caching/list`;

    /** with dynamic actionType */
    const body = {
      ...requestTemplate,
      actionType,
      params: {
        ...paramsTemplate,
        options: { depKey, store },
      },
    };

    const res = await rest.sendRequest(path, 'PUT', body, true);
    const [items, error] = rest.parseResponse(res);
    const { dataItems = null } = items;

    if (error) throw new Error(error);

    const dep = {
      depStore,
      dataItems,
      actionType,
      store,
      schema,
      clientDB,
      multipleLoadData,
      updateBy,
    };

    await getterCacheThunk(dispatch, dep, depActions);
  } catch (error) {
    const depError = {
      depStore,
      depKey,
      store,
      actionType,
      clientDB,
      schema,
      Request,
      updateBy,
      multipleLoadData,
      setRequestError,
      setAppStatus,
      rest,
    };
    console.error(error);
    errorThunk(error, dispatch, depError);
  }
};

const middlewareUpdate = ({
  id = '',
  key = '',
  updateField = '',
  updateItem,
  store = {},
  actionType = 'default',
  updateBy = '_id',
  parsedRoutePath,
  clientDB = null,
  systemMessage = {},
}) => async (dispatch, getState, { schema, Request }) => {
  /**
   * Props
   * @param {string} id
   * @param {string} key
   * @param {string} updateField
   * @param {Object} item
   * @param {object | string} updateItem
   * @param {object} store
   * @param {string} actionType
   */

  const rest = new Request();
  /**
   * update by @property {string} id more prioritized than @property {string} key
   */

  try {
    const path =
      actionType === actionsTypes.$UPDATE_MANY
        ? `/system/${store}/update/many`
        : actionType === actionsTypes.$UPDATE_SINGLE
        ? `/system/${store}/update/single`
        : '';

    if (!path) throw new TypeError('Bad action type');

    const body = {
      ...requestTemplate,
      actionType,
      params: {
        ...paramsTemplate,
        options: { id, key },
        updateItem,
        updateField,
      },
    };

    const res = await rest.sendRequest(path, 'POST', body, true);
    const [items, error] = rest.parseResponse(res);
    const { dataItems = null } = items;

    if (error) throw new Error(error);
    const dep = {
      parsedRoutePath,
      updateBy,
      store,
      schema,
      dataItems:
        Array.isArray(dataItems) && dataItems.length === 1 ? dataItems[dataItems.length - 1] : dataItems,
      id: id ? id : key,
      refreshRouteDataItem,
    };

    await updateEntityThunk(dispatch, dep);

    if (systemMessage?.done) message.success(systemMessage.done);
  } catch (error) {
    const depError = {
      parsedRoutePath,
      store,
      actionType,
      clientDB,
      schema,
      Request,
      setRequestError,
      multipleLoadData,
      setAppStatus,
      rest,
    };
    console.error(error);
    errorThunk(error, dispatch, depError);
    if (systemMessage?.error) message.error(systemMessage.error);
  }
};

const settingsLoadAction = ({ wishList = [] }) => async (dispatch, getState, { Request }) => {
  const rest = new Request();

  const artifacts = [];
  const settings = [];

  for await (let wish of wishList) {
    try {
      const { name = '', params = {} } = wish;
      const { method = 'GET', body = {} } = params;
      const paramsRequest = {
        actionType: actionsTypes.$SETTINGS_LOAD,
        ...body,
      };

      const res = await rest.sendRequest(`/settings/${name}`, method, paramsRequest, true);

      if (!res || (res.status !== 200 && res.status !== 404)) {
        throw new Error('Invalid loading settings');
      }

      const { data: { response: { metadata = [] } = {} } = {} } = res;
      const config = metadata[0];
      settings.push(config);
    } catch (error) {
      console.error(error);
      artifacts.push(wish);
    }
  }

  if (artifacts.length) {
    dispatch(loadArtifact(artifacts));
  }

  dispatch(loadSettings(settings));
};

export { middlewareCaching, middlewareUpdate, loadCacheData, settingsLoadAction };
