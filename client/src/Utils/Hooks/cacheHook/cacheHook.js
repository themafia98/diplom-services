import { getStoreSchema } from '../../utilsHook';

const cachingHook = async (dispatch, dep = {}, depActions = {}) => {
  const { dataItems = {}, store, actionType, clientDB, schema } = dep;
  const { сachingAction, errorRequstAction } = depActions;

  try {
    const schemTemplate = getStoreSchema(store, null);
    const dataList = Array.isArray(dataItems) ? dataItems : [dataItems];
    const validHash = dataList.map((it) => schema?.getSchema(schemTemplate, it)).filter(Boolean);

    if (validHash || (!schemTemplate && dataItems)) {
      clientDB.addItem(store, validHash);
      dispatch(
        сachingAction({
          data: schemTemplate ? validHash : dataItems,
          load: true,
          primaryKey: actionType,
        }),
      );
    } else throw new Error('Invalid data props');
  } catch (error) {
    console.error(error);
    dispatch(errorRequstAction(error.message));
  }
};

const getterCacheHook = async (dispatch, dep = {}, depActions = {}, typeHook = 'afterLoading') => {
  const { dataItems, actionType, store, schema, clientDB } = dep;
  const { errorRequstAction, сachingAction } = depActions;

  try {
    if (typeHook === 'afterLoading') {
      const schemTemplate = getStoreSchema(store);

      const dataList = Array.isArray(dataItems) ? dataItems : [dataItems];
      const validHash = dataList.map((it) => schema?.getSchema(schemTemplate, it)).filter(Boolean);

      if (validHash || (!schemTemplate && dataItems)) {
        await clientDB.addItem(store, !schemTemplate ? dataItems : validHash);
        dispatch(сachingAction({ data: validHash, load: true, primaryKey: actionType }));
      } else throw new Error('Invalid data props');
      return;
    }

    const { depStore, item = {}, type, uid, Request } = dep;

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
};

export default { cachingHook, getterCacheHook };
