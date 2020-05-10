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
  const { statusApp = 'online', clientDB = null } = dep;
  if (!storeName || _.isEmpty(body)) return;
  try {
    if (statusApp === 'online') {
      const rest = new Request();

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

    const offlineBody = { ...body, offline: true };
    const { clientDB = {} } = this.context;
    const putAction = await clientDB.addItem('tasks', offlineBody);
    return { result: putAction, offline: true };
  } catch (error) {
    console.error(error);
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
