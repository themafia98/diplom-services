// @ts-nocheck
import _ from 'lodash';
import {
  TASK_SCHEMA,
  USER_SCHEMA,
  TASK_CONTROLL_JURNAL_SCHEMA,
  NEWS_SCHEMA,
  CREATE_TASK_SCHEMA,
  WIKI_NODE_TREE,
} from './const';

class Schema {
  /**
   * @private
   * @type {string|null}
   */
  #mode = null;
  /** @param {string} modeProp */
  constructor(modeProp = 'no-strict') {
    this.#mode = modeProp;
  }

  getMode() {
    return this.#mode;
  }

  /** @param {string} type */
  getValidateSchema(type) {
    switch (type) {
      case TASK_SCHEMA:
        return {
          _id: null,
          editor: null,
          date: null,
          comments: null, // array [{ id: null, username: null, message: null }]
          key: null,
          status: null,
          name: null,
          priority: null,
          uidCreater: null,
          authorName: null,
          description: null,
          tags: null,
        };
      case CREATE_TASK_SCHEMA:
        return {
          key: null,
          editor: null,
          date: null,
          comments: null,
          status: null,
          name: null,
          priority: null,
          authorName: null,
          uidCreater: null,
          description: null,
        };
      case TASK_CONTROLL_JURNAL_SCHEMA:
        return {
          _id: null,
          depKey: null,
          timeLost: null,
          editor: null,
          date: null,
          description: null,
        };
      case USER_SCHEMA:
        return {
          _id: null,
          email: null,
          displayName: null,
          summary: null,
          phone: null,
          isOnline: null,
          departament: null,
          position: null,
          rules: null,
          accept: null,
          avatar: null,
          isHideEmail: null,
          isHidePhone: null,
        };
      case NEWS_SCHEMA:
        return {
          _id: null,
          title: null,
          content: null, // { entityMap: null,blocks: null }
        };
      case WIKI_NODE_TREE:
        return {
          _id: null,
          title: null,
          level: null,
          path: null,
          index: null,
          parentId: null,
          accessGroups: null,
        };
      default:
        return null;
    }
  }

  /**
   * Schema
   * @return {Object} Object
   */
  getEditorJSON() {
    return {
      entityMap: {},
      blocks: [
        {
          key: '637gr',
          text: 'Initialized from content state.',
          type: 'unstyled',
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [],
          data: {},
        },
      ],
    };
  }

  /**
   *
   * @param {string} value
   * @returns {boolean}
   */
  isPublicKey(value) {
    if (Array.isArray(value) || _.isPlainObject(value)) {
      if (_.isPlainObject(value)) {
        return Object.keys(value).every((val) => val !== 'createdAt' && val !== 'updatedAt' && val !== '__v');
      }
      return value.every((val) => val !== 'createdAt' && val !== 'updatedAt' && val !== '__v');
    }
    return value !== 'createdAt' && value !== 'updatedAt' && value !== '__v';
  }

  /**
   * Schema
   * @param {Array<string>} keysData
   * @param {Array<object>} keysSchema
   * @param {Object} data
   * @return {boolean}
   */
  validateSchema(keysData, keysSchema, data) {
    if (!_.isArray(keysData) || !_.isArray(keysSchema)) return false;
    let validLenth = keysData.length;

    const isFindMode = keysData.findIndex((it) => it === 'modeAdd' && _.isString(data[it])) !== -1;
    if (isFindMode) validLenth--;

    const isCreated = keysData.findIndex((it) => it === 'createdAt' && _.isString(data[it])) !== -1;
    if (isCreated) validLenth--;

    const isUpdated = keysData.findIndex((it) => it === 'updatedAt' && _.isString(data[it])) !== -1;
    if (isUpdated) validLenth--;

    const isVersion = keysData.findIndex((it) => it === '__v' && _.isNumber(data[it])) !== -1;
    if (isVersion) validLenth--;

    if (keysSchema.length !== validLenth) return false;

    return this.getMode() !== 'no-strict'
      ? keysData.every((dataKey, i) => dataKey === keysSchema[i])
      : keysData.every((dataKey) => {
          if (dataKey !== 'modeAdd' && this.isPublicKey(dataKey)) {
            return keysSchema.findIndex((it) => it === dataKey) !== -1;
          }
          return true;
        });
  }

  /**
   * @return {Object} valid schema object or null
   * @param {string} type string
   * @param {Object} data string
   */
  getSchema(type, data) {
    if (!_.isObject(data)) return null;
    if (!_.isString(type)) return null;
    if (_.isNull(data)) return null;

    let keysSchema = null;
    const keysData = Object.keys(data);

    const schema = this.getValidateSchema(type);
    if (schema) keysSchema = Object.keys(schema);
    else return null;

    if (this.validateSchema(keysData, keysSchema, data)) {
      return { ...data };
    } else return null;
  }
}

export default Schema;
