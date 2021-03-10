import {
  TASK_SCHEMA,
  USER_SCHEMA,
  TASK_CONTROLL_JURNAL_SCHEMA,
  NEWS_SCHEMA,
  CREATE_TASK_SCHEMA,
  WIKI_NODE_TREE,
} from './const';
import Ajv from 'ajv';
import { APP_STATUS } from 'App.constant';

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

  /**
   * @api
   */
  validator = new Ajv();

  getMode() {
    return this.#mode;
  }

  addAdditionalProperty() {
    return {
      additionalProperties: {
        _id: { type: 'string' },
        updatedAt: { type: 'string' },
        createdAt: { type: 'string' },
        offline: { type: 'boolean' },
        _v: { type: 'string' },
      },
    };
  }

  /** @param {string} type */
  getValidateSchema(type) {
    switch (type) {
      case TASK_SCHEMA:
        return {
          type: 'object',
          additionalProperties: true,
          properties: {
            _id: { type: 'string' },
            type: { type: 'string' },
            editor: { type: 'array' },
            date: { type: 'array', items: { type: 'string' } },
            comments: { type: 'array', items: { type: 'object' } },
            key: { type: 'string' },
            status: { type: 'string' },
            name: { type: 'string' },
            priority: { type: 'string' },
            uidCreater: { type: 'string' },
            authorName: { type: 'string' },
            description: { type: 'string' },
            additionalCreaterData: { type: 'object', default: {} },
            tags: { type: 'array' },
          },
          ...this.addAdditionalProperty(),
        };
      case CREATE_TASK_SCHEMA:
        return {
          type: 'object',
          additionalProperties: false,
          properties: {
            key: { type: 'string' },
            editor: { type: 'array', items: { type: 'string' } },
            date: { type: 'array', items: { type: 'string' } },
            comments: { type: 'array' },
            status: { type: 'string' },
            name: { type: 'string' },
            priority: { type: 'string' },
            authorName: { type: 'string' },
            uidCreater: { type: 'string' },
            description: { type: 'string' },
          },
        };
      case TASK_CONTROLL_JURNAL_SCHEMA:
        return {
          type: 'object',
          additionalProperties: true,
          properties: {
            depKey: { type: 'string' },
            timeLost: { type: 'string' },
            editor: { type: 'string' },
            date: {
              oneOf: [{ type: 'array', items: { type: 'string' } }, { type: 'string' }],
            },
            description: { type: 'string' },
          },
          ...this.addAdditionalProperty(),
        };
      case USER_SCHEMA:
        return {
          type: 'object',
          additionalProperties: false,
          properties: {
            _id: { type: 'string' },
            email: { type: 'string' },
            displayName: { type: 'string' },
            summary: { type: 'string' },
            phone: { type: 'string' },
            isOnline: { type: 'boolean', default: false },
            departament: { type: 'string' },
            position: { type: 'string' },
            rules: { type: 'string' },
            accept: { type: 'boolean' },
            role: { type: 'string', default: 'GUEST' },
            avatar: { type: 'string', default: '' },
            isHideEmail: { type: 'boolean' },
            isHidePhone: { type: 'boolean' },
          },
        };
      case NEWS_SCHEMA:
        return {
          type: 'object',
          additionalProperties: true,
          properties: {
            title: { type: 'string' },
            content: { type: 'object' }, // { entityMap: null,blocks: null },
            key: { type: 'string' },
          },
          ...this.addAdditionalProperty(),
        };
      case WIKI_NODE_TREE:
        return {
          type: 'object',
          additionalProperties: true,
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            level: { type: 'number' },
            path: { type: 'string' },
            index: { type: 'number' },
            parentId: { type: 'string' },
            accessGroups: { type: 'array' },
            key: { type: 'string' },
          },
          ...this.addAdditionalProperty(),
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
          text: '',
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
    const isObject = value && typeof value === 'object';
    if (Array.isArray(value) || isObject) {
      if (isObject) {
        return Object.keys(value).every((val) => val !== 'createdAt' && val !== 'updatedAt' && val !== '__v');
      }
      return value.every((val) => val !== 'createdAt' && val !== 'updatedAt' && val !== '__v');
    }
    return value !== 'createdAt' && value !== 'updatedAt' && value !== '__v';
  }

  /**
   * Schema
   * @deprecated 23.05 2020
   * @param {Array<string>} keysData
   * @param {Array<object>} keysSchema
   * @param {Object} data
   * @return {boolean}
   */
  deprecated_validateSchema(keysData, keysSchema, data, type = '') {
    if ([keysData, keysSchema].some((type) => !Array.isArray(type))) return false;
    let validLenth = keysData.length;
    let IS_SHOULD_USE_KEY = false;

    const isFindMode = keysData.findIndex((it) => it === APP_STATUS.OFF) !== -1;
    if (isFindMode) validLenth--;

    const isCreated = keysData.findIndex((it) => it === 'createdAt' && typeof data[it] === 'string') !== -1;
    if (isCreated) {
      validLenth--;
    }

    const isUpdated = keysData.findIndex((it) => it === 'updatedAt' && typeof data[it] === 'string') !== -1;
    if (isUpdated) validLenth--;

    const isVersion = keysData.findIndex((it) => it === '__v' && typeof data[it] === 'string') !== -1;
    if (isVersion) validLenth--;

    if (
      type === NEWS_SCHEMA &&
      keysData.findIndex((it) => it === '_id' && typeof data[it] === 'string') !== -1
    ) {
      validLenth--;
      IS_SHOULD_USE_KEY = true;
    }

    if (keysSchema.length !== validLenth) return false;

    return this.getMode() !== 'no-strict'
      ? keysData.every((dataKey, i) => dataKey === keysSchema[i])
      : keysData.every((dataKey) => {
          const IS_KEY_UNIQE = dataKey === '_id' && IS_SHOULD_USE_KEY;
          if (dataKey !== APP_STATUS.OFF && this.isPublicKey(dataKey) && !IS_KEY_UNIQE) {
            return keysSchema.findIndex((it) => it === dataKey) !== -1;
          } else if (IS_KEY_UNIQE) return true;

          return true;
        });
  }

  getSchema(type, data) {
    if (!(data && typeof data === 'object') || typeof type !== 'string' || data === null) return null;

    const schema = this.getValidateSchema(type);
    const validate = this.validator.compile(schema);

    if (validate(data)) return data;
    else {
      console.error('invalid data:', type);
      return null;
    }
  }

  /**
   * @deprecated 23.05.2020
   * @return {Object} valid schema object or null
   * @param {string} type string
   * @param {Object} data string
   */
  deprecated_getSchema(type, data) {
    if (!(data && typeof data === 'object') || typeof type !== 'string' || data === null) return null;

    let keysSchema = null;
    const keysData = Object.keys(data);

    const schema = this.getValidateSchema(type);
    if (schema) keysSchema = Object.keys(schema);
    else return null;

    if (this.deprecated_validateSchema(keysData, keysSchema, data, type)) {
      return { ...data };
    } else return null;
  }
}

export default Schema;
