import { sortedByKey } from 'Utils';
import { VIEW_ACTION_TYPE } from '../TaskModule.constant';

export const getClassNameByStatus = (status) => {
  return status === 'Выполнен'
    ? 'done'
    : status === 'Закрыт'
    ? 'close'
    : status === 'В работе'
    ? 'active'
    : null;
};

export const selectTaskViewCache = (caches, uuid) => {
  let cachesJurnalList = null;
  let cachesEditorList = null;
  let cachesAuthorList = null;

  if (caches && typeof caches === 'object') {
    for (let [key, value] of Object.entries(caches)) {
      if (key.includes(VIEW_ACTION_TYPE.GET_LOGS) && value?.depKey === uuid) {
        if (!cachesJurnalList) {
          cachesJurnalList = [];
        }

        cachesJurnalList.push(value);
        continue;
      }

      if (!key.includes(`taskView#${uuid}`)) {
        continue;
      }

      if (key.includes('editor')) {
        if (!cachesEditorList) {
          cachesEditorList = [];
        }

        cachesEditorList.push(value);
        continue;
      }

      if (key.includes('author')) {
        if (!cachesAuthorList) {
          cachesAuthorList = [];
        }

        cachesAuthorList.push(value);
      }
    }
  }

  return [
    cachesAuthorList,
    cachesEditorList,
    sortedByKey(cachesJurnalList, 'date', 'date', 'DD.MM.YYYY HH:mm:ss'),
  ];
};
