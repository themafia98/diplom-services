// @ts-nocheck
import { createAction } from 'redux-actions';
import {
  SET_ACTIVE_CHAT_TOKEN,
  SET_SOCKET_CONNECTION,
  LOAD_CHATS_LIST,
  INVALID_LOAD_SOCKET,
  ADD_CHAT_MSG,
  UPDATE_ENTITY_SOCKET,
} from './const';

export const setActiveChatToken = createAction(SET_ACTIVE_CHAT_TOKEN);
export const onLoadActiveChats = createAction(LOAD_CHATS_LIST);
export const setSocketConnection = createAction(SET_SOCKET_CONNECTION);
export const setSocketError = createAction(INVALID_LOAD_SOCKET);
export const updateRoom = createAction(UPDATE_ENTITY_SOCKET);
export const addMsg = createAction(ADD_CHAT_MSG);
