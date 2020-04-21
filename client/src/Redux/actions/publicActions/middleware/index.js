import { сachingAction, errorRequstAction } from '../';
import { cachingHook, getterCacheHook, errorHook } from '../../../../Utils';
import { updateItemStateAction } from '../../routerActions';
import { TASK_CONTROLL_JURNAL_SCHEMA, USER_SCHEMA, TASK_SCHEMA } from '../../../../Models/Schema/const';

/**
 * Middleware
 * @param {object} props
 * @param {object} schema - validator
 * @param {Function} Request - http requests
 * @param {object} clientDB - IndexedDB methods
 */

const middlewareCaching = (props) => async (dispatch, getState, { schema, Request, clientDB }) => {
  const { status = 'online' } = getState().publicReducer;
  const { actionType = '', item = {}, depKey = '', depStore = '', store = '', uid = '', type = '' } = props;
  const isOnline = status === 'online';

  const depActions = {
    errorRequstAction,
    сachingAction,
  };

  try {
    if (actionType?.includes('__get')) {
      /** cahing items middleware */

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
      };

      await cachingHook(dispatch, dep, depActions);
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

    await getterCacheHook(dispatch, dep, depActions);
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
    };
    console.error(error);
    errorHook(error, dispatch, depError);
  }
};

const loadCacheData = (props = {}) => async (dispatch, getState, { schema, Request, clientDB }) => {
  const {
    actionType = '', // key
    depKey = '',
    depStore = '',
    store = '',
  } = props;

  const depActions = {
    errorRequstAction,
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
    };

    await getterCacheHook(dispatch, dep, depActions, 'afterLoading');
  } catch (error) {
    console.error(error);
    dispatch(errorRequstAction(error.message));
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
    type = 'UPDATE',
    updateField = '',
    updateItem,
    store = {},
    actionType = 'default',
  } = props;

  const { status = 'online' } = getState().publicReducer;

  if (status === 'online') {
    switch (type) {
      case 'UPDATE': {
        try {
          const isMany = actionType === 'update_many';
          const path = isMany ? `/system/${store}/update/many` : `/system/${store}/update/single`;
          const rest = new Request();

          const body = { queryParams: { id, key }, updateItem, updateField };

          const res = await rest.sendRequest(path, 'POST', body, true);
          const [items, error] = rest.parseResponse(res);
          const { dataItems: updaterItem = null } = items;

          if (error) throw new Error(error);

          const schemTemplate =
            store === 'jurnalworks'
              ? TASK_CONTROLL_JURNAL_SCHEMA
              : store === 'users'
              ? USER_SCHEMA
              : store === 'tasks'
              ? TASK_SCHEMA
              : null;

          const storeCopy = [updaterItem].map((it) => schema.getSchema(schemTemplate, it)).filter(Boolean);

          if (storeCopy) {
            dispatch(
              updateItemStateAction({
                updaterItem: updaterItem,
                type,
                id,
              }),
            );

            if (schema.isPublicKey(updaterItem)) await clientDB.updateItem(store, updaterItem);
            break;
          }
        } catch (error) {
          console.error(error);
          dispatch(errorRequstAction(error.message));
          break;
        }

        break;
      }

      default: {
        break;
      }
    }
  }
};

export { middlewareCaching, middlewareUpdate, loadCacheData };
