import { getStoreSchema } from '../utilsHook';
import { dataParser } from '../';

/** Events */
const sucessEvent = async (dispatch, dep, mode = '', multiple = false, cursor = null, offlineStore = []) => {
  const copyStoreOffline = [...offlineStore];
  const {
    copyStore,
    primaryKey,
    storeLoad,
    schema,
    pathValid,
    saveComponentStateAction,
    errorRequestAction,
    params,
  } = dep;

  if (mode === 'offline') {
    const schemaTemplate = getStoreSchema(storeLoad);

    const itemsCopy = cursor.map((it) => schema?.getSchema(schemaTemplate, it)).filter(Boolean);
    const data = {
      [storeLoad]: itemsCopy,
      load: true,
      path: pathValid,
      mode: 'offline',
      params,
      loading: false,
    };

    if (!multiple) {
      dispatch(saveComponentStateAction(data));
      return;
    } else return data;
  }
  if (!cursor) {
    const { data = {}, shoudClearError = false } = dataParser(true, true, dep, offlineStore);
    if (shoudClearError) await dispatch(errorRequestAction(null));

    if (!multiple) {
      dispatch(saveComponentStateAction({ ...data, params, loading: false }));
      return;
    } else return data;
  }

  const index = copyStore.findIndex((it) => {
    const isKey = it[primaryKey] || it['key'];
    const { key } = cursor || {};
    const isValid = it[primaryKey] === key || it['key'] === key;

    return isKey && isValid;
  });
  const iEmpty = index === -1;

  if (!iEmpty && cursor.value?.offline) {
    copyStoreOffline.push({ ...cursor.value, offline: false });
  }
  return await sucessEvent(dispatch, dep, mode, multiple, await cursor.continue(), copyStoreOffline);
};

const forceUpdateDetectedInit = () => {
  window.addEventListener('beforeunload', (event) => {
    event.returnValue = `Are you sure you want to leave?`;
  });
};

const namespaceEvents = {
  sucessEvent,
  forceUpdateDetectedInit,
};

export default namespaceEvents;
