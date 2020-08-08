import moment from 'moment';
import { ACTIONS } from './Modal.constant';

const modalState = {
  visible: false,
  reg: {
    name: null,
    password: null,
    departament: null,
    email: null,
    surname: null,
  },
  jurnal: {
    timeLost: null,
    date: moment().format('DD.MM.YYYY HH:mm:ss'),
    description: null,
  },
  description: {
    value: null,
  },
  error: new Set(),
  loading: false,
  taskStatus: null,
  type: null,
};

const reducer = (state, { type, payload }) => {
  switch (type) {
    case ACTIONS.CHANGE_TYPE:
      return {
        ...state,
        type: payload,
      };
    case ACTIONS.CHANGE_ROOT:
      return {
        ...state,
        ...payload,
      };
    case ACTIONS.CHANGE_DESCRIPTION:
      return {
        ...state,
        description: payload,
      };
    default:
      return state;
  }
};

export { reducer, modalState };
