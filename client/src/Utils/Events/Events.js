import { USER_SCHEMA, TASK_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from '../../Models/Schema/const';
import { dataParser } from '../';
const namespaceEvents = {
  sucessEvent: async (dispatch, dep, mode = '', event) => {
    const { target: { result: cursor = [] } = {} } = event;
    const {
      copyStore,
      primaryKey,
      undefiendCopyStore,
      storeLoad,
      schema,
      pathValid,
      saveComponentStateAction,
      errorRequstAction,
    } = dep;

    if (mode === 'offline') {
      const schemaTemplate =
        storeLoad === 'jurnalworks'
          ? TASK_CONTROLL_JURNAL_SCHEMA
          : storeLoad === 'users'
          ? USER_SCHEMA
          : storeLoad === 'tasks'
          ? TASK_SCHEMA
          : null;

      const itemsCopy = cursor.map(it => schema.getSchema(schemaTemplate, it)).filter(Boolean);

      dispatch(
        saveComponentStateAction({
          [storeLoad]: itemsCopy,
          load: true,
          path: pathValid,
          mode: 'offline',
        }),
      );
      return;
    }

    if (!cursor) {
      const { data, shoudClearError = false } = dataParser(true, true, dep);
      if (shoudClearError) await dispatch(errorRequstAction(null));
      await dispatch(saveComponentStateAction(data));
      return;
    }

    const index = copyStore.findIndex(it => {
      const isKey = it[primaryKey] || it['key'];
      const isValid = it[primaryKey] === cursor.key || it['key'] === cursor.key;

      return isKey && isValid;
    });
    const iEmpty = index === -1;
    if (copyStore && iEmpty) {
      if (cursor.value.modeAdd === 'offline') {
        const copy = { ...cursor.value, modeAdd: 'online' };
        cursor.value.modeAdd = 'online';
        undefiendCopyStore.push({ ...copy });
      }
    }
    cursor.continue();
  },

  forceUpdateDetectedInit: () => {
    window.addEventListener('beforeunload', event => {
      event.returnValue = `Are you sure you want to leave?`;
    });
  },
};

export default namespaceEvents;
