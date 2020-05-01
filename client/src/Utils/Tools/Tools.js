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

const createEntity = async (storeName = '', body = {}, sliceCreaterNumber = 0) => {
  if (!storeName || _.isEmpty(body)) return;
  const rest = new Request();

  const createPath = `${storeName[0].toUpperCase()}${storeName.slice(1)}`;
  return await rest.sendRequest(
    `/${storeName}/create${createPath.slice(0, sliceCreaterNumber ? sliceCreaterNumber : createPath.length)}`,
    'POST',
    body,
    true,
  );
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
