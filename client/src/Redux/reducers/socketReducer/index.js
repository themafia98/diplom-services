import {
  SET_ACTIVE_CHAT_TOKEN,
  SET_SOCKET_CONNECTION,
  INVALID_LOAD_SOCKET,
  LOAD_CHATS_LIST,
  ADD_CHAT_MSG,
  UPDATE_ENTITY_SOCKET,
} from '../../actions/socketActions/const';

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

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_SOCKET_CONNECTION: {
      const { payload: { activeModule = 'chat', socketConnection = false } = {} } = action || {};

      return {
        ...state,
        activeSocketModule: activeModule,
        socketConnection,
      };
    }

    case SET_ACTIVE_CHAT_TOKEN: {
      const { chat = {} } = state;
      const { tokenRoom, listdataMsgs = [], isFake = null, shouldLoadingMessage = false } =
        action.payload || {};

      return {
        ...state,
        chat: {
          ...state.chat,
          chatToken: tokenRoom || { chatToken: null },
          listdataMsgs: !isFake
            ? {
                ...chat.listdataMsgs,
                [tokenRoom]: [...listdataMsgs],
              }
            : {},
          isFake,
          shouldLoadingMessage,
        },
      };
    }

    case UPDATE_ENTITY_SOCKET: {
      const { room = {}, msg = {} } = action.payload || {};
      const { tokenRoom = '' } = room || {};
      const { chat: { chatToken: activeToken = '', listdata = [], listdataMsgs = {} } = {} } = state || {};

      const msgs = typeof listdataMsgs === 'object' && listdataMsgs !== null ? listdataMsgs : {};

      if ((!room || !action.payload.room) && activeToken !== null) {
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
    }

    case ADD_CHAT_MSG: {
      const { chat: { chatToken = '' } = {}, chat = {} } = state || {};
      const msg = action.payload;

      const messages = [...state.chat.listdataMsgs[chatToken]];

      const validMessages = messages
        .map(msgItem => {
          if (msgItem._id !== msg._id) {
            return msgItem;
          }
          return null;
        })
        .filter(Boolean);

      return {
        ...state,
        chat: {
          ...state.chat,
          listdataMsgs: {
            ...chat.listdataMsgs,
            [chatToken]: [...validMessages, { ...msg }],
          },
        },
      };
    }

    case INVALID_LOAD_SOCKET: {
      const { msg, socketConnection } = action.payload || {};
      return {
        ...state,
        socketConnection,
        socketErrorStatus: msg,
      };
    }

    case LOAD_CHATS_LIST: {
      const {
        usersList = [],
        activeChatRoom = null,
        listdata = [],
        options: { socket: { socketConnection = false, module: activeSocketModule } = {} } = {},
        shouldLoadingMessage = false,
      } = action.payload || {};
      const { chat: { tokenRoom = '' } = {} } = state;

      let sortListdata = [...listdata].sort((a, b) => Date(a.date) - Date(b.date));
      const duplicateFixed = sortListdata.filter(item => {
        const isExists = item && item.tokenRoom;
        const findItem = isExists ? item.tokenRoom === tokenRoom : null;
        if (findItem) return item;
      });

      const fakeItem = duplicateFixed.find(it => it?.tokenRoom?.include('__fakeRoom'));

      sortListdata = fakeItem
        ? sortListdata
            .map(it => {
              if (it?.tokenRoom?.include('__fakeRoom')) {
                return null;
              }
              return it;
            })
            .filter(Boolean)
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
          ...state.chat,
          usersList,
          listdata: [...sortListdata],
          shouldLoadingMessage,
          ...activeProps,
        },
      };
    }

    default: {
      return state;
    }
  }
};
