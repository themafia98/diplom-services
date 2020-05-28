import { handleActions } from 'redux-actions';
import {
  SET_ACTIVE_CHAT_TOKEN,
  SET_SOCKET_CONNECTION,
  INVALID_LOAD_SOCKET,
  LOAD_CHATS_LIST,
  ADD_CHAT_MSG,
  UPDATE_ENTITY_SOCKET,
} from 'Redux/actions/socketActions/const';

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

export default handleActions(
  {
    [SET_SOCKET_CONNECTION]: (state, { payload }) => {
      const { activeModule = 'chat', socketConnection = false } = payload || {};
      return {
        ...state,
        activeSocketModule: activeModule,
        socketConnection,
      };
    },
    [SET_ACTIVE_CHAT_TOKEN]: (state, { payload }) => {
      const {
        chat = {},
        chat: { listdataMsgs: currentMsgs = [] },
      } = state;
      const { tokenRoom, listdataMsgs = [], isFake = null, shouldLoadingMessage = false } = payload;

      return {
        ...state,
        chat: {
          ...chat,
          chatToken: tokenRoom || { chatToken: null },
          listdataMsgs: !isFake
            ? {
                ...currentMsgs,
                [tokenRoom]: [...listdataMsgs],
              }
            : {},
          isFake,
          shouldLoadingMessage,
        },
      };
    },
    [UPDATE_ENTITY_SOCKET]: (state, { payload }) => {
      const { room = null, msg = {} } = payload || {};
      const { chat: { chatToken: activeToken = '', listdata = [], listdataMsgs = {} } = {} } = state || {};
      const { tokenRoom = '' } = room || {};

      const msgs = typeof listdataMsgs === 'object' && listdataMsgs !== null ? listdataMsgs : {};

      if ((!room || !room) && activeToken !== null) {
        const isFake = activeToken.includes('fakeRoom');
        const newActiveToken = isFake ? activeToken.split('__')[0] : activeToken;
        return {
          ...state,
          chat: {
            ...state.chat,
            chatToken: newActiveToken,
            listdataMsgs: {},
          },
        };
      }
      return {
        ...state,
        chat: {
          ...state.chat,
          chatToken: tokenRoom,
          listdata: [...listdata, room],
          listdataMsgs: {
            ...msgs,
            [tokenRoom]: [msg],
          },
        },
      };
    },
    [ADD_CHAT_MSG]: (state, { payload }) => {
      const { chat: { chatToken = '', listdataMsgs } = {} } = state || {};
      const { _id: idPayload = '' } = payload;
      const messages = [...listdataMsgs[chatToken]];

      const validMessages = messages.reduce((msgs, msgItem) => {
        if (msgItem._id !== idPayload) {
          return [...msgs, msgItem];
        }
        return msgs;
      }, []);

      return {
        ...state,
        chat: {
          ...state.chat,
          listdataMsgs: {
            ...listdataMsgs,
            [chatToken]: [...validMessages, { ...payload }],
          },
        },
      };
    },
    [INVALID_LOAD_SOCKET]: (state, { payload }) => {
      const { msg, socketConnection } = payload || {};
      return {
        ...state,
        socketConnection,
        socketErrorStatus: msg,
      };
    },
    [LOAD_CHATS_LIST]: (state, { payload }) => {
      const {
        usersList = [],
        activeChatRoom = null,
        listdata = [],
        options: { socket: { socketConnection = false, module: activeSocketModule } = {} } = {},
        shouldLoadingMessage = false,
      } = payload || {};
      const { chat: { tokenRoom = '' } = {}, chat = {} } = state;

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

      let activeProps = {};

      if (activeChatRoom) {
        const { tokenRoom: token = '' } = activeChatRoom || {};
        activeProps = {
          chatToken: token,
          isFake: null,
        };
      }

      return {
        ...state,
        socketConnection,
        activeSocketModule,
        chat: {
          ...chat,
          usersList,
          listdata: [...sortListdata],
          shouldLoadingMessage,
          ...activeProps,
        },
      };
    },
  },
  initialState,
);
