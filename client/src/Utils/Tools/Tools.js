import _ from 'lodash';
import Request from 'Models/Rest';
import config from 'config.json';
import NotFound from 'Modules/NotFound';
import subModulesComponents from './subComponents';
import componentsModules from './components';
import types from 'types.modules';
import actionsTypes from 'actions.types';

/**
 *
 * @param {string} type notification type
 * @param {object} item notification entity
 * @param {string} actionType - default: set
 */
const createNotification = async (type = '', item = {}, actionType = actionsTypes.$SET_NOTIFICATION) => {
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

/**
 *
 * @param {string} storeName name module
 * @param {object} body entity
 * @param {object} dep entity dependences
 * @param {number} sliceCreaterNumber slice start name of entity, default: 0
 */
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

/**
 *
 * @param {string} store name module
 * @param {object} body file
 */
const deleteFile = async (store = '', body = {}) => {
  if (!store || _.isEmpty(body)) return;
  const rest = new Request();
  return await rest.sendRequest(
    `/system/${store}/delete/file`,
    'DELETE',
    {
      actionType: actionsTypes.$DELETE_FILE,
      ...body,
    },
    true,
  );
};

/**
 *
 * @param {string} store name module
 * @param {object} body file
 */
const loadFile = async (store = '', body = {}) => {
  if (!store || _.isEmpty(body)) return;
  const rest = new Request();
  return await rest.sendRequest(
    `/system/${store}/load/file`,
    'PUT',
    {
      actionType: actionsTypes.$PUT_FILE,
      ...body,
    },
    true,
  );
};

/**
 *
 * @param {object} target - target entity object
 * @param {string} key - find by key in entity
 */
const findData = (target, key) => {
  try {
    if (!target || typeof target !== 'object') throw new TypeError('target is not object');

    const resultKey = Object.keys(target).find((targetKey) => targetKey.includes(key));
    return target[resultKey];
  } catch (error) {
    console.error(error);
    return target;
  }
};

/**
 * @returns {import('react').Component} React component
 * @param {string} key - component key
 * @param {string} type - component type
 */
const getComponentByKey = (key, type = types.$entrypoint_module) => {
  try {
    if (!key || typeof key !== 'string') throw new TypeError('key should be string');
    const components = type === types.$entrypoint_module ? componentsModules : subModulesComponents;
    const Component = components[key];

    if (!_.isUndefined(Component)) return Component;

    const componentKey = Object.keys(components).find((componentKey) => key.includes(componentKey));
    if (componentKey) return components[componentKey];

    throw new Error(`Not found page ${key}, type: ${type}`);
  } catch (error) {
    console.error(error);
    return NotFound;
  }
};

const getDependencyModules = (moduleName, configuration = config, exclude = []) => {
  const { menu = [] } = configuration || {};

  return menu.reduce((depList, item) => {
    const { EUID = '' } = item || {};

    if (exclude.some((key) => key === EUID)) return depList;
    if (moduleName && EUID.includes(moduleName) && EUID !== moduleName) {
      return [...depList, EUID];
    }
    return depList;
  }, []);
};

/**
 *
 * @param  {...Symbol} types
 *
 * Compare types function
 */
const oneOfType = (...types) => (type) => types.find((typeName) => typeName === type);

export default {
  createNotification,
  createEntity,
  deleteFile,
  loadFile,
  findData,
  getComponentByKey,
  getDependencyModules,
  oneOfType,
};
