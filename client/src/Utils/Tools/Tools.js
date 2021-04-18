import _ from 'lodash';
import Request from 'Models/Rest';
import NotFound from 'Modules/NotFound';
import subModulesComponents from './subComponents';
import componentsModules from './components';
import types from 'types.modules';
import actionsTypes from 'actions.types';
import { requestTemplate, paramsTemplate } from 'Utils/Api/api.utils';
import { APP_STATUS } from 'App.constant';
import { showSystemMessage } from 'Utils';

const findUser = async (uid) => {
  if (!uid) return null;

  try {
    const rest = new Request();
    const { data } = await rest.sendRequest(`/cabinet/findUser?uid=${uid}`, 'GET', null, true);
    const { metadata = [] } = data.response || {};

    return metadata?.[0];
  } catch (error) {
    console.error(error);
    return null;
  }
};

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
      ...requestTemplate,
      actionType,
      params: {
        ...paramsTemplate,
        item,
      },
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
const createEntity = async (
  storeName,
  params,
  dep,
  sliceCreaterNumber,
  customTaskModule,
  method = 'POST',
) => {
  const { metadata = {} } = params || {};
  const { statusApp = APP_STATUS.ON, clientDB = null, onSetStatus } = dep || {};

  if (!storeName || _.isEmpty(params)) return;
  try {
    const rest = new Request();
    if (statusApp === APP_STATUS.ON) {
      const createPath = `${storeName[0].toUpperCase()}${storeName.slice(1)}`;
      const res = await rest.sendRequest(
        `/${storeName}/create${createPath.slice(
          0,
          sliceCreaterNumber ? sliceCreaterNumber : createPath.length,
        )}`,
        method,
        {
          ...requestTemplate,
          actionType: `create_${storeName}`,
          moduleName: customTaskModule || storeName,
          params,
        },
        true,
      );

      if (res.status !== 200) {
        if (res?.status !== 404) console.error(res);
        throw new Error('Bad response');
      }

      return { result: res, offline: res?.status !== 404 ? false : true };
    }

    const offlineBody =
      metadata && !_.isEmpty(metadata) ? { ...metadata, offline: true } : { ...params, offline: true };
    const putAction = clientDB ? await clientDB.addItem(storeName, offlineBody) : null;

    if (!clientDB) console.warn('client db connect');

    return { result: putAction ? { ...offlineBody } : null, offline: true };
  } catch (error) {
    console.error(error);

    if (error?.message === 'Network Error' && onSetStatus) {
      await onSetStatus({
        statusRequst: APP_STATUS.OFF,
      });

      return await createEntity(storeName, params, { ...dep, statusApp: APP_STATUS.OFF }, sliceCreaterNumber);
    }

    const { response } = error?.response.data || {};
    const { customErrorMessage = '' } = response?.params || {};

    if (customErrorMessage) {
      showSystemMessage('error', customErrorMessage);
    }

    return { result: null, offline: null };
  }
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

    if (Component !== undefined) return Component;

    const componentKey = Object.keys(components).find((componentKey) => key.includes(componentKey));
    if (componentKey) return components[componentKey];

    throw new Error(`Not found page ${key}, type: ${type}`);
  } catch (error) {
    console.error(error);
    return NotFound;
  }
};

const getDependencyModules = (moduleName, configuration = null, exclude = []) => {
  const { menu = [] } = configuration || {};

  return menu.reduce((depList, item) => {
    const { EUID = '' } = item || {};

    if (exclude.some((key) => key === EUID)) {
      return depList;
    }

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

const getValidRouteData = ({ currentRouteData }, { uuid, depRouteDataKey }, store = '') => {
  if (!currentRouteData && depRouteDataKey) {
    const { [store]: storeList = [] } = findData(currentRouteData, depRouteDataKey) || {};
    return storeList.find((it) => it?._id === uuid) || {};
  }
  return null;
};

/**
 *
 * @param {Object} activePage
 * @param {Request} rest
 * @returns
 */
const checkPageAvailable = async (activePage, rest) => {
  try {
    let moduleName = null;
    const moduleIndex = activePage.path.indexOf('Module');

    if (!moduleName && moduleName !== 0) {
      moduleName = activePage.path.slice(0, moduleIndex + 'Module'.length);
    }

    const response = await rest.sendRequest(
      '/system/security/page',
      'POST',
      { moduleName, activePage },
      true,
    );

    if (response.status !== 200) {
      throw new Error('Invlid page');
    }
  } catch (error) {
    console.error(error);

    return false;
  }

  return true;
};

const isToken = () => !!localStorage.getItem('token');

const tools = {
  createNotification,
  createEntity,
  findData,
  getComponentByKey,
  getDependencyModules,
  oneOfType,
  getValidRouteData,
  findUser,
  checkPageAvailable,
  isToken,
};

export default tools;
