// @ts-nocheck
import { getStoreSchema } from '../utilsHook';
import { dataParser } from '../';

/** Events */
const sucessEvent = async (dispatch, dep, mode = '', multiple = false, cursor = null) => {
  const {
    copyStore,
    primaryKey,
    undefiendCopyStore,
    storeLoad,
    schema,
    pathValid,
    saveComponentStateAction,
    errorRequstAction,
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
    const { data = {}, shoudClearError = false } = dataParser(true, true, dep);
    if (shoudClearError) await dispatch(errorRequstAction(null));

    if (!multiple) {
      dispatch(saveComponentStateAction({ ...data, params, loading: false }));
      return;
    } else return data;
  }

  const index = copyStore.findIndex((it) => {
    const isKey = it[primaryKey] || it['key'];
    const isValid = it[primaryKey] === cursor.key || it['key'] === cursor.key;

    return isKey && isValid;
  });
  const iEmpty = index === -1;
  if (copyStore && iEmpty) {
    if (cursor.value.modeAdd === 'offline') {
      const copy = { ...cursor.value, modeAdd: 'online' };
      cursor.value.modeAdd = 'online';
      undefiendCopyStore.push({ ...copy });
    }
  }
  return await namespaceEvents.sucessEvent(dispatch, dep, mode, multiple, await cursor.continue());
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
