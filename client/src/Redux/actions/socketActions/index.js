import {
  SET_ACTIVE_CHAT_TOKEN,
  SET_SOCKET_CONNECTION,
  LOAD_CHATS_LIST,
  INVALID_LOAD_SOCKET,
  ADD_CHAT_MSG,
  UPDATE_ENTITY_SOCKET,
} from './const';

export /**
 * @param {{ listdata?: any[]; tokenRoom: any; isFake?: any; listdataMsgs?: any; shouldLoadingMessage?: boolean; }} state
 */
const setActiveChatToken = state => {
  return {
    type: SET_ACTIVE_CHAT_TOKEN,
    payload: state,
  };
};

export /**
 * @param {{ usersList: any; activeChatRoom?: any; shouldLoadingMessage?: any; listdata: any; options: any; }} state
 */
const onLoadActiveChats = state => {
  return {
    type: LOAD_CHATS_LIST,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const addMsg = state => {
  return {
    type: ADD_CHAT_MSG,
    payload: state,
  };
};

export /**
 * @param {{ socketConnection: any; activeModule: any; }} state
 */
const setSocketConnection = state => {
  return {
    type: SET_SOCKET_CONNECTION,
    payload: state,
  };
};

export /**
 * @param {{ socketConnection: any; msg: any; }} state
 */
const setSocketError = state => {
  return {
    type: INVALID_LOAD_SOCKET,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const updateRoom = state => {
  return {
    type: UPDATE_ENTITY_SOCKET,
    payload: state,
  };
};
