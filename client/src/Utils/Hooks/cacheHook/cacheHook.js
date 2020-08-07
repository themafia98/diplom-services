import { getStoreSchema } from '../../utilsHook';
import actionsTypes from 'actions.types';
import { requestTemplate, paramsTemplate } from 'Utils/Api/api.utils';

const cachingHook = async (dispatch, dep = {}, depActions = {}) => {
  const { dataItems = {}, store, actionType, clientDB, schema, updateBy } = dep;
  const { сachingAction, errorRequestAction } = depActions;

  try {
    const schemaTemplate = getStoreSchema(store, null);
    const dataList = Array.isArray(dataItems) ? dataItems : [dataItems];
    const validHash = dataList.map((it) => schema?.getSchema(schemaTemplate, it)).filter(Boolean);

    if (validHash || (!schemaTemplate && dataItems)) {
      if (clientDB) clientDB.addItem(store, validHash);
      else console.warn('No client db connect');
      dispatch(
        сachingAction({
          data: schemaTemplate ? validHash : dataItems,
          load: true,
          uuid: actionType,
          updateBy,
        }),
      );
    } else throw new Error('Invalid data props');
  } catch (error) {
    console.error(error);
    dispatch(errorRequestAction(error.message));
  }
};

const putterCacheHook = async (dispatch, dep = {}, depActions = {}) => {
  const { depStore, item = {}, type, uid, Request, actionType, updateBy = '' } = dep;
  const { errorRequestAction, сachingAction } = depActions;

  try {
    const path = `/${depStore}/${type ? type : 'caching'}`;
    const rest = new Request();

    /** dynamic actionType */
    const body = {
      ...requestTemplate,
      actionType,
      params: {
        ...paramsTemplate,
        options: { uid },
        item,
      },
    };

    const res = await rest.sendRequest(path, 'PUT', body, true);
    const [items, error] = rest.parseResponse(res);

    if (error) throw new Error(error);

    if (items && type === 'logger') {
      const path = `/${depStore}/${type ? type : 'caching'}`;
      const rest = new Request();

      const body = {
        ...requestTemplate,
        actionType: actionsTypes.$GET_USER_SETTINGS_LOGS,
        params: {
          ...paramsTemplate,
          options: { uid },
        },
      };

      const res = await rest.sendRequest(path, 'POST', body, true);
      const [items, error] = rest.parseResponse(res);
      const { dataItems: updaterItem = null } = items;

      if (error) throw new Error(error);

      dispatch(сachingAction({ data: updaterItem, load: true, uuid: actionType, updateBy }));
    }
  } catch (error) {
    console.error(error);
    dispatch(errorRequestAction(error.message));
  }
};

const getterCacheHook = async (dispatch, dep = {}, depActions = {}) => {
  const { dataItems, actionType, store, schema, clientDB, updateBy } = dep;
  const { errorRequestAction, сachingAction } = depActions;

  try {
    const schemaTemplate = getStoreSchema(store);

    const dataList = Array.isArray(dataItems) ? dataItems : [dataItems];
    const validHash = dataList.map((it) => schema?.getSchema(schemaTemplate, it)).filter(Boolean);

    if (validHash || (!schemaTemplate && dataItems)) {
      if (clientDB) await clientDB.addItem(store, !schemaTemplate ? dataItems : validHash);
      else console.warn('No client db connect');

      dispatch(сachingAction({ data: validHash, load: true, uuid: actionType, updateBy }));
    } else throw new Error('Invalid data props');
  } catch (error) {
    console.error(error);
    dispatch(errorRequestAction(error.message));
  }
};

export default { cachingHook, getterCacheHook, putterCacheHook };
