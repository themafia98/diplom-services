import { сachingAction, errorRequstAction } from '../';
import { updateItemStateAction } from '../../routerActions';
import { TASK_CONTROLL_JURNAL_SCHEMA, USER_SCHEMA, TASK_SCHEMA } from '../../../../Models/Schema/const';

/**
 * Middleware
 * @param {object} props
 * @param {object} schema - validator
 * @param {object} Request - http requests
 * @param {clientDB} clientDB - IndexedDB methods
 */

const middlewareCaching = (props = {}) => async (dispatch, getState, { schema, Request, clientDB }) => {
  const { status = 'online' } = getState().publicReducer;

  const { actionType = '', item = {}, depKey = '', depStore = '', store = '', uid = '', type = '' } = props;

  if (status === 'online') {
    switch (actionType) {
      case '__setJurnal': {
        try {
          const path = `/${depStore}/caching/jurnal`;
          const body = { queryParams: { depKey, depStore }, item };
          const rest = new Request();

          const res = await rest.sendRequest(path, 'PUT', body, true);
          const [items, error] = rest.parseResponse(res);
          const { dataItems: updaterItem = null } = items;

          if (error) throw new Error(error);

          // const schemTemplate =
          //   store === 'jurnalworks'
          //     ? TASK_CONTROLL_JURNAL_SCHEMA
          //     : store === 'users'
          //     ? USER_SCHEMA
          //     : store === 'tasks'
          //     ? TASK_SCHEMA
          //     : null;

          // const validHash = [updaterItem]
          //     .map(it => schema.getSchema(schemTemplate, it))
          //     .filter(Boolean);

          if (updaterItem) {
            clientDB.addItem(store, updaterItem);

            dispatch(сachingAction({ data: updaterItem, load: true, primaryKey: actionType }));
          } else throw new Error('Invalid data props');
        } catch (error) {
          console.error(error);
          dispatch(errorRequstAction(error.message));
        }

        break;
      }

      default: {
        try {
          const path = `/${depStore}/${type ? type : 'caching'}`;
          const rest = new Request();

          const body = { queryParams: { uid }, item, actionType };

          const res = await rest.sendRequest(path, 'PUT', body, true);
          const [items, error] = rest.parseResponse(res);

          if (error) throw new Error(error);

          if (items && type === 'logger') {
            const actionType = 'get_user_settings_log';

            const path = `/${depStore}/${type ? type : 'caching'}`;
            const rest = new Request();

            const body = { queryParams: { uid }, actionType };

            const res = await rest.sendRequest(path, 'POST', body, true);
            const [items, error] = rest.parseResponse(res);
            const { dataItems: updaterItem = null } = items;

            if (error) throw new Error(error);

            dispatch(сachingAction({ data: updaterItem, load: true, primaryKey: actionType }));
          }
        } catch (error) {
          console.error(error);
          dispatch(errorRequstAction(error.message));
        }
      }
    }
  }
};

const loadCacheData = (props = {}) => async (dispatch, getState, { schema, Request, clientDB }) => {
  const {
    actionType = '', // key
    depKey = '',
    depStore = '',
    store = '',
  } = props;

  const { status = 'online' } = getState().publicReducer;

  if (status === 'online') {
    switch (actionType) {
      case '__setJurnal': {
        try {
          const path = `/${depStore}/caching/list`;
          const rest = new Request();

          const body = { queryParams: { depKey, store }, actionType };

          const res = await rest.sendRequest(path, 'PUT', body, true);
          const [items, error] = rest.parseResponse(res);
          const { dataItems: updaterItem = null } = items;

          if (error) throw new Error(error);

          // const schemTemplate =
          //   store === 'jurnalworks'
          //     ? TASK_CONTROLL_JURNAL_SCHEMA
          //     : store === 'users'
          //     ? USER_SCHEMA
          //     : store === 'tasks'
          //     ? TASK_SCHEMA
          //     : null;

          // const validHash = [updaterItem]
          //     .map(it => schema.getSchema(schemTemplate, it))
          //     .filter(Boolean);

          if (updaterItem) {
            await clientDB.addItem(store, updaterItem);
            dispatch(сachingAction({ data: updaterItem, load: true, primaryKey: actionType }));
          } else throw new Error('Invalid data props');
        } catch (error) {
          console.error(error);
          dispatch(errorRequstAction(error.message));
        }

        break;
      }

      default: {
        break;
      }
    }
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

          const storeCopy = [updaterItem].map(it => schema.getSchema(schemTemplate, it)).filter(Boolean);

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
