import { SET_ACTIVE_CHAT_TOKEN, SET_SOCKET_CONNECTION, LOAD_CHATS_LIST } from "./const";

export const setActiveChatToken = state => {
    return {
        type: SET_ACTIVE_CHAT_TOKEN,
        payload: state
    };
};

export const onLoadActiveChats = state => {
    return {
        type: LOAD_CHATS_LIST,
        payload: state,
    }
}

export const setSocketConnection = state => {
    return {
        type: SET_SOCKET_CONNECTION,
        payload: state
    }
}