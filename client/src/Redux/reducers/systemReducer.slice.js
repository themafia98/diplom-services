import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loader: false,
  systemMessage: '',
  type: 'info',
};

const systemSlice = createSlice({
  name: 'systemReducer',
  initialState,
  reducers: {
    setSystemMessage: {
      reducer: (state, { payload }) => {
        const { msg, type } = payload;
        if (msg === state.systemMessage) {
          return;
        }
        state.systemMessage = payload;
        state.type = type;
      },
      prepare: (msgData) => ({ payload: msgData }),
    },
    showSystemLoader: {
      reducer: (state, { payload }) => ({ ...state, loader: payload }),
      prepare: (showLoader) => ({ payload: showLoader }),
    },
  },
});

export const { setSystemMessage, showSystemLoader } = systemSlice.actions;

export default systemSlice.reducer;
