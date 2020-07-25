import { сachingAction, errorRequestAction, setStatus } from '../';
import { cachingHook, getterCacheHook, putterCacheHook, errorHook, updateEntityHook } from 'Utils';
import { onLoadArtifacts, onLoadSettings } from '../';
import { multipleLoadData } from '../../routerActions/middleware';
import { updateItemStateAction } from '../../routerActions';
import actionsTypes from 'actions.types';

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
    errorRequestAction,
    сachingAction,
  };

  try {
    if (actionType?.includes('__get')) {
      /** caching items middleware */

      const path = `/${depStore}/caching/jurnal`;
      const body = {
        actionType: actionsTypes.$CACHING_JURNAL,
        queryParams: { depKey, depStore },
        item,
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

      await cachingHook(dispatch, dep, depActions);
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

    await putterCacheHook(dispatch, dep, depActions);
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
      errorRequestAction,
      setStatus,
      multipleLoadData,
      rest,
    };
    console.error(error);
    errorHook(error, dispatch, depError);
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
    errorRequestAction,
    сachingAction,
  };

  try {
    const path = `/${depStore}/caching/list`;

    /** with dynamic actionType */
    const body = { queryParams: { depKey, store }, actionType };

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

    await getterCacheHook(dispatch, dep, depActions);
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
      errorRequestAction,
      setStatus,
      rest,
    };
    console.error(error);
    errorHook(error, dispatch, depError);
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

    const body = { actionType, queryParams: { id, key }, updateItem, updateField };

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
      updateItemStateAction,
    };

    await updateEntityHook(dispatch, dep);
  } catch (error) {
    const depError = {
      parsedRoutePath,
      store,
      actionType,
      clientDB,
      schema,
      Request,
      errorRequestAction,
      multipleLoadData,
      setStatus,
      rest,
    };
    console.error(error);
    errorHook(error, dispatch, depError);
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
    dispatch(onLoadArtifacts(artifacts));
  }

  dispatch(onLoadSettings(settings));
};

export { middlewareCaching, middlewareUpdate, loadCacheData, settingsLoadAction };
