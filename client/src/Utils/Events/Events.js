import { getStoreSchema } from '../utilsHook';
import { dataParser } from '../';
import { message } from 'antd';
import { APP_STATUS } from 'App.constant';
import { refreshRouterData } from 'Redux/reducers/routerReducer.slice';
import { setRequestError } from 'Redux/reducers/publicReducer.slice';

/** Events */
const sucessEvent = async (dispatch, dep, mode = '', multiple = false, cursor = null, offlineStore = []) => {
  const copyStoreOffline = [...offlineStore];
  const { copyStore, uuid, storeLoad, schema, pathValid, params } = dep;

  if (mode === APP_STATUS.OFF) {
    const schemaTemplate = getStoreSchema(storeLoad);

    const itemsCopy = cursor.map((it) => schema?.getSchema(schemaTemplate, it)).filter(Boolean);
    const data = {
      [storeLoad]: itemsCopy,
      load: true,
      path: pathValid,
      mode: APP_STATUS.OFF,
      params,
      loading: false,
    };

    if (!multiple) {
      dispatch(refreshRouterData(data));
      return;
    } else return data;
  }
  if (!cursor) {
    const { data = {}, shoudClearError = false } = dataParser(dep, offlineStore);
    if (shoudClearError) {
      await dispatch(setRequestError(null));
    }

    if (!multiple) {
      dispatch(refreshRouterData({ ...data, params, loading: false }));
      return;
    } else return data;
  }

  const index = copyStore.findIndex((it) => {
    const isKey = it[uuid] || it['key'];
    const { key } = cursor || {};
    const isValid = it[uuid] === key || it['key'] === key;

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

const showSystemMessage = (type = '', msg = '') => {
  switch (type) {
    case 'loading':
      return message.loading(msg, 1);
    case 'success':
      return message.success(msg);
    case 'error':
      return message.error(msg);
    case 'warn':
      return message.warn(msg);
    default:
      return message.info(msg);
  }
};

const namespaceEvents = {
  sucessEvent,
  forceUpdateDetectedInit,
  showSystemMessage,
};

export default namespaceEvents;
