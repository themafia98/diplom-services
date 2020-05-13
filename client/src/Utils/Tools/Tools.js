// @ts-nocheck
import _ from 'lodash';
import Request from '../../Models/Rest';

const createNotification = async (type = '', item = {}, actionType = 'set_notification') => {
  if (!type || _.isEmpty(item)) return;
  const rest = new Request();
  return rest.sendRequest(
    `/system/${type}/notification`,
    'POST',
    {
      item,
      actionType,
    },
    true,
  );
};

const createEntity = async (storeName = '', body = {}, dep = {}, sliceCreaterNumber = 0) => {
  const { metadata = {} } = body || {};
  const { statusApp = 'online', clientDB = null, onSetStatus } = dep;

  if (!storeName || _.isEmpty(body)) return;
  try {
    const rest = new Request();
    if (statusApp === 'online') {
      const createPath = `${storeName[0].toUpperCase()}${storeName.slice(1)}`;
      const res = await rest.sendRequest(
        `/${storeName}/create${createPath.slice(
          0,
          sliceCreaterNumber ? sliceCreaterNumber : createPath.length,
        )}`,
        'POST',
        body,
        true,
      );

      if (res.status !== 200) {
        if (res?.status !== 404) console.error(res);
        throw new Error('Bad response');
      }

      return { result: res, offline: res?.status !== 404 ? false : true };
    }

    const offlineBody =
      metadata && !_.isEmpty(metadata) ? { ...metadata, offline: true } : { ...body, offline: true };
    const putAction = await clientDB.addItem(storeName, offlineBody);

    return { result: putAction ? { ...offlineBody } : null, offline: true };
  } catch (error) {
    console.error(error);

    if (error?.message === 'Network Error' && onSetStatus) {
      await onSetStatus({
        statusRequst: 'offline',
      });

      return await createEntity(storeName, body, { ...dep, statusApp: 'offline' }, sliceCreaterNumber);
    }
    return { result: null, offline: null };
  }
};

const deleteFile = async (store = '', body = {}) => {
  if (!store || _.isEmpty(body)) return;
  const rest = new Request();
  return await rest.sendRequest(`/system/${store}/delete/file`, 'DELETE', body, true);
};

const loadFile = async (store = '', body = {}) => {
  if (!store || _.isEmpty(body)) return;
  const rest = new Request();
  return await rest.sendRequest(`/system/${store}/load/file`, 'PUT', body, true);
};

export default {
  createNotification,
  createEntity,
  deleteFile,
  loadFile,
};
