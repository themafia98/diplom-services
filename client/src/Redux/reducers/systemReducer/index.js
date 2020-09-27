import { handleActions } from 'redux-actions';
import { SET_SYSTEM_MESSAGE, SHOW_SYSTEM_LOADER } from 'Redux/actions/systemActions/systemActions.const';

const initialState = {
  loader: false,
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
    [SHOW_SYSTEM_LOADER]: (state, { payload }) => ({ ...state, loader: payload }),
  },
  initialState,
);