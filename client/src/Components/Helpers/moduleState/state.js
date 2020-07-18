import { SET_VISIBILITY } from './constants';

const contextState = {
  visibility: false,
  availableBackground: false,
};

const contextReducer = (state = contextState, { payload, type }) => {
  switch (type) {
    case SET_VISIBILITY: {
      const { visibility = false, availableBackground = false } = payload;
      return {
        ...state,
        visibility,
        availableBackground,
      };
    }
    default:
      return state;
  }
};

export { contextReducer, contextState };
