import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  socketConnection: false,
  activeSocketModule: null,
  socketErrorStatus: null,
  chat: {
    chatToken: null,
    limitList: null,
    usersList: [],
    listdata: [],
    listdataMsgs: {},
    isFake: null,
    shouldLoadingMessage: false,
  },
};

const socketSlice = createSlice({
  name: 'socketReducer',
  initialState,
  reducers: {
    setSocketConnection: {
      // SET_SOCKET_CONNECTION
      reducer: (state, { payload }) => {
        const { activeModule = 'chat', socketConnection = false } = payload;

        state.activeSocketModule = activeModule;
        state.socketConnection = socketConnection;
      },
      prepare: (chatConnectConfig) => ({ payload: chatConnectConfig }),
    },
    setInvalidSocketConnection: {
      // INVALID_LOAD_SOCKET
      reducer: (state, { payload }) => {
        const { msg, socketConnection } = payload;

        state.socketConnection = socketConnection;
        state.socketErrorStatus = msg;
      },
      prepare: (chatConnectConfig) => ({ payload: chatConnectConfig }),
    },
    setActiveChatToken: {
      // SET_ACTIVE_CHAT_TOKEN
      reducer: (state, { payload }) => {
        const { tokenRoom, listdataMsgs, isFake, shouldLoadingMessage } = payload;

        state.chat.chatToken = tokenRoom || { chatToken: null };
        state.chat.isFake = isFake;
        state.chat.shouldLoadingMessage = shouldLoadingMessage;

        if (!isFake) {
          state.chat.listdataMsgs[tokenRoom] = listdataMsgs;
          return;
        }

        state.chat.listdataMsgs = {};
      },
      prepare: (chatRoomData) => ({ payload: chatRoomData }),
    },
    updateChatEntity: {
      // UPDATE_ENTITY_SOCKET
      reducer: (state, { payload }) => {
        const { room = null, msg } = payload;

        const { chat } = state;
        const { chatToken: activeToken, listdata, listdataMsgs } = chat;

        const { tokenRoom = '' } = room || {};

        const msgs = typeof listdataMsgs === 'object' && listdataMsgs !== null ? listdataMsgs : {};

        if ((!room || !room) && activeToken !== null) {
          const isFake = activeToken.includes('fakeRoom');
          const newActiveToken = isFake ? activeToken.split('__')[0] : activeToken;
          state.chat.chatToken = newActiveToken;
          state.chat.listdataMsgs = {};
          return;
        }

        state.chat.chatToken = tokenRoom;
        state.chat.listdata = [...listdata, room];
        state.chat.listdataMsgs = { ...msgs, [tokenRoom]: [msg] };
      },
      prepare: (chatEntityData) => ({ payload: chatEntityData }),
    },
    addChatMsg: {
      // ADD_CHAT_MSG
      reducer: (state, { payload }) => {
        const { chatToken, listdataMsgs } = state.chat;

        const { _id: msgId = '' } = payload;

        const messages = listdataMsgs[chatToken].reduce((msgs, msgItem) => {
          if (msgItem._id !== msgId) {
            return [...msgs, msgItem];
          }
          return msgs;
        }, []);

        state.chat.listdataMsgs = { ...listdataMsgs, [chatToken]: [...messages, payload] };
      },
      prepare: (msgData) => ({ payload: msgData }),
    },
    loadChats: {
      // LOAD_CHATS_LIST
      reducer: (state, { payload }) => {
        const {
          usersList = [],
          activeChatRoom = null,
          listdata = [],
          options = {},
          shouldLoadingMessage = false,
        } = payload;
        const { socketConnection = false, module: activeSocketModule } = options?.socket || {};
        const { tokenRoom = '' } = state.chat;

        let sortListdata = [...listdata].sort((a, b) => Date(a.date) - Date(b.date));

        const duplicateFixed = sortListdata.filter((item) => {
          const isExists = item && item.tokenRoom;
          const findItem = isExists ? item.tokenRoom === tokenRoom : null;
          if (findItem) return item;
          else return false;
        });

        const fakeItem = duplicateFixed.find((it) => it?.tokenRoom?.include('__fakeRoom'));

        sortListdata = fakeItem
          ? sortListdata.reduce((dataList, it) => {
              if (it?.tokenRoom?.include('__fakeRoom')) return dataList;

              return [...dataList, it];
            }, [])
          : sortListdata;

        state.socketConnection = socketConnection;
        state.activeSocketModule = activeSocketModule;
        state.chat.usersList = usersList;
        state.chat.listdata = sortListdata;
        state.shouldLoadingMessage = shouldLoadingMessage;

        if (activeChatRoom) {
          state.chat.chatToken = activeChatRoom?.tokenRoom || '';
          state.chat.isFake = null;
        }
      },
      prepare: (chatsData) => ({ payload: chatsData }),
    },
  },
});

export const {
  setSocketConnection,
  setInvalidSocketConnection,
  setActiveChatToken,
  updateChatEntity,
  addChatMsg,
  loadChats,
} = socketSlice.actions;

export default socketSlice.reducer;
