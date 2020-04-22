// @ts-nocheck
/** Utils events */
import {
  WIKI_NODE_TREE,
  USER_SCHEMA,
  TASK_SCHEMA,
  TASK_CONTROLL_JURNAL_SCHEMA,
  NEWS_SCHEMA,
} from '../Models/Schema/const';

const getStoreSchema = (store, methodQuery = null) => {
  switch (store) {
    case 'wiki':
      if (methodQuery === 'get_all') return WIKI_NODE_TREE;
      else return null;
    case 'jurnalworks':
      return TASK_CONTROLL_JURNAL_SCHEMA;
    case 'users':
      return USER_SCHEMA;
    case 'tasks':
      return TASK_SCHEMA;
    case 'news':
      return NEWS_SCHEMA;
    default:
      return null;
  }
};

export { getStoreSchema };
