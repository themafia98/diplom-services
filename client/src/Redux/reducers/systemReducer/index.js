import { handleActions } from 'redux-actions';
import { SET_SYSTEM_MESSAGE } from 'Redux/actions/systemActions/systemActions.const';

const initialState = {
  systemMessage: '',
  type: 'info',
};

export default handleActions(
  {
    [SET_SYSTEM_MESSAGE]: (state, { payload }) => {
      const { msg = '', type = '' } = payload;
      if (msg === state.systemMessage) {
        return state;
      }
      return {
        ...state,
        systemMessage: payload,
        type,
      };
    },
  },
  initialState,
);
