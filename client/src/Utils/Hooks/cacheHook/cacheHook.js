// @ts-nocheck
import { getStoreSchema } from '../../utilsHook';

const cachingHook = async (dispatch, dep = {}, depActions = {}) => {
  const { dataItems = {}, store, actionType, clientDB, schema, updateBy } = dep;
  const { сachingAction, errorRequstAction } = depActions;

  try {
    const schemaTemplate = getStoreSchema(store, null);
    const dataList = Array.isArray(dataItems) ? dataItems : [dataItems];
    const validHash = dataList.map((it) => schema?.getSchema(schemaTemplate, it)).filter(Boolean);

    if (validHash || (!schemaTemplate && dataItems)) {
      clientDB.addItem(store, validHash);
      dispatch(
        сachingAction({
          data: schemaTemplate ? validHash : dataItems,
          load: true,
          primaryKey: actionType,
          updateBy,
        }),
      );
    } else throw new Error('Invalid data props');
  } catch (error) {
    console.error(error);
    dispatch(errorRequstAction(error.message));
  }
};

const putterCacheHook = async (dispatch, dep = {}, depActions = {}) => {
  const { depStore, item = {}, type, uid, Request, actionType, updateBy = '' } = dep;
  const { errorRequstAction, сachingAction } = depActions;

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

      dispatch(сachingAction({ data: updaterItem, load: true, primaryKey: actionType, updateBy }));
    }
  } catch (error) {
    console.error(error);
    dispatch(errorRequstAction(error.message));
  }
};

const getterCacheHook = async (dispatch, dep = {}, depActions = {}) => {
  const { dataItems, actionType, store, schema, clientDB, updateBy } = dep;
  const { errorRequstAction, сachingAction } = depActions;

  try {
    const schemaTemplate = getStoreSchema(store);

    const dataList = Array.isArray(dataItems) ? dataItems : [dataItems];
    const validHash = dataList.map((it) => schema?.getSchema(schemaTemplate, it)).filter(Boolean);

    if (validHash || (!schemaTemplate && dataItems)) {
      await clientDB.addItem(store, !schemaTemplate ? dataItems : validHash);
      dispatch(сachingAction({ data: validHash, load: true, primaryKey: actionType, updateBy }));
    } else throw new Error('Invalid data props');
  } catch (error) {
    console.error(error);
    dispatch(errorRequstAction(error.message));
  }
};

export default { cachingHook, getterCacheHook, putterCacheHook };
