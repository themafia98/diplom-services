import _ from 'lodash';
import {
  TASK_SCHEMA,
  USER_SCHEMA,
  TASK_CONTROLL_JURNAL_SCHEMA,
  NEWS_SCHEMA,
  CREATE_TASK_SCHEMA,
} from './const';

class Schema {
  /** @param {string} modeProp */
  constructor(modeProp = 'no-strict') {
    this.mode = modeProp;
  }

  /** @param {string} type */
  getValidateSchema(type) {
    switch (type) {
      case TASK_SCHEMA:
        return {
          editor: null,
          date: null,
          comments: null, // array [{ id: null, username: null, message: null }]
          _id: null,
          key: null,
          status: null,
          name: null,
          priority: null,
          author: null,
          description: null,
          modeAdd: 'any',
        };
      case CREATE_TASK_SCHEMA:
        return {
          editor: null,
          date: null,
          comments: null,
          key: null,
          status: null,
          name: null,
          priority: null,
          author: null,
          description: null,
          modeAdd: 'any',
        };
      case TASK_CONTROLL_JURNAL_SCHEMA:
        return {
          depKey: null,
          timeLost: null,
          editor: null,
          date: null,
          description: null,
          modeAdd: 'any',
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
          modeAdd: 'any',
        };
      case NEWS_SCHEMA:
        return {
          title: null,
          content: null, // { entityMap: null,blocks: null }
        };
      default:
        return null;
    }
  }

  /**
   * Schema
   * @param {string} type
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
   * Schema
   * @param {Array<string>} data
   * @param {Array<null>} schema
   * @param {string} mode
   * @return {boolean}
   */
  validateSchema(data, schema) {
    //
    if (!_.isArray(data) || !_.isArray(schema)) return false;

    const isFind = schema.findIndex(it => it === 'modeAdd') !== -1;
    const isFindBoth = isFind && data.findIndex(it => it === 'modeAdd') !== -1;
    if (
      (isFindBoth && data.length !== schema.length) ||
      (isFind && !isFindBoth && data.length + 1 !== schema.length) ||
      (!isFind && data.length !== schema.length)
    ) {
      return false;
    }

    return this.mode !== 'no-strict'
      ? data.every((dataKey, i) => dataKey === schema[i])
      : data.every(dataKey => schema.findIndex(it => it === dataKey) !== -1);
  }

  /**
   * @return {Object} valid schema object or null
   * @param {string} type string
   * @param {Object} data string
   * @param {string} mode string
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

    if (this.validateSchema(keysData, keysSchema, this.mode)) {
      return { ...data };
    } else return null;
  }
}

export default Schema;
