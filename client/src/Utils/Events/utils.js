/** Utils events */
import { USER_SCHEMA, TASK_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from '../../Models/Schema/const';

const getStoreSchema = store => {
  switch (store) {
    case 'jurnalworks':
      return TASK_CONTROLL_JURNAL_SCHEMA;
    case 'users':
      return USER_SCHEMA;
    case 'tasks':
      return TASK_SCHEMA;
    default:
      return null;
  }
};

export { getStoreSchema };
