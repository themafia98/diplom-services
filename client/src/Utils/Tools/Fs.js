import actionsTypes from 'actions.types';
import _ from 'lodash';
import Request from 'Models/Rest';
import { requestTemplate } from 'Utils/Api/api.utils';

const fs = {
  /**
   *
   * @param {string} store name module
   * @param {object} body file
   */
  deleteFile: async (store = '', body = {}) => {
    if (!store || _.isEmpty(body)) return;
    const rest = new Request();
    return await rest.sendRequest(
      `/system/${store}/delete/file`,
      'DELETE',
      {
        ...requestTemplate,
        actionType: actionsTypes.$DELETE_FILE,
        ...body,
      },
      true,
    );
  },
  /**
   *
   * @param {string} store name module
   * @param {object} body file
   */
  loadFile: async (store = '', body = {}) => {
    if (!store || _.isEmpty(body)) return;
    const rest = new Request();
    return await rest.sendRequest(
      `/system/${store}/load/file`,
      'PUT',
      {
        ...requestTemplate,
        actionType: actionsTypes.$PUT_FILE,
        ...body,
      },
      true,
    );
  },
};

export default fs;
