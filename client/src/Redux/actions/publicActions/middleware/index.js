// @ts-nocheck
import { сachingAction, errorRequestAction, setStatus } from '../';
import {
  cachingHook,
  getterCacheHook,
  putterCacheHook,
  errorHook,
  updateEntityHook,
} from '../../../../Utils';
import { updateItemStateAction } from '../../routerActions';

/**
 * Middleware
 * @param {object} props
 * @param {object} schema - validator
 * @param {Function} Request - http requests
 * @param {object} clientDB - IndexedDB methods
 */

const middlewareCaching = (props) => async (dispatch, getState, { schema, Request, clientDB }) => {
  const {
    actionType = '',
    item = {},
    depKey = '',
    depStore = '',
    store = '',
    uid = '',
    type = '',
    updateBy = '_id',
  } = props;

  const depActions = {
    errorRequestAction,
    сachingAction,
  };

  try {
    if (actionType?.includes('__get')) {
      /** caching items middleware */

      const path = `/${depStore}/caching/jurnal`;
      const body = { queryParams: { depKey, depStore }, item };
      const rest = new Request();

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
    };
    console.error(error);
    errorHook(error, dispatch, depError);
  }
};

const loadCacheData = (props) => async (dispatch, getState, { schema, Request, clientDB }) => {
  const {
    actionType = '', // key
    depKey = '',
    depStore = '',
    store = '',
    updateBy = '_id',
  } = props;

  const depActions = {
    errorRequestAction,
    сachingAction,
  };

  try {
    const path = `/${depStore}/caching/list`;
    const rest = new Request();

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
      errorRequestAction,
      setStatus,
    };
    console.error(error);
    errorHook(error, dispatch, depError);
  }
};

/**
 * Middleware
 * @param {object} props
 * @param {object} schema - validator
 * @param {object} Request - http requests
 * @param {clientDB} clientDB - IndexedDB methods
 */

const middlewareUpdate = (props = {}) => async (dispatch, getState, { schema, Request, clientDB }) => {
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
  const {
    id = '',
    key = '',
    updateField = '',
    updateItem,
    store = {},
    actionType = 'default',
    updateBy = '_id',
  } = props;

  /**
   * update by @property {string} key more prioritized than @property {string} id
   */
  try {
    const isMany = actionType === 'update_many';
    const path = isMany ? `/system/${store}/update/many` : `/system/${store}/update/single`;
    const rest = new Request();

    const body = { queryParams: { id, key }, updateItem, updateField };

    const res = await rest.sendRequest(path, 'POST', body, true);
    const [items, error] = rest.parseResponse(res);
    const { dataItems = null } = items;

    if (error) throw new Error(error);
    const dep = { updateBy, store, schema, dataItems, id: key ? key : id, updateItemStateAction };

    await updateEntityHook(dispatch, dep);
  } catch (error) {
    const depError = {
      store,
      actionType,
      clientDB,
      schema,
      Request,
      errorRequestAction,
      setStatus,
    };
    console.error(error);
    errorHook(error, dispatch, depError);
  }
};

export { middlewareCaching, middlewareUpdate, loadCacheData };
