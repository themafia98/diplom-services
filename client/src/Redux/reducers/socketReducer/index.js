import {
    SET_ACTIVE_CHAT_TOKEN,
    SET_SOCKET_CONNECTION,
    INVALID_LOAD_SOCKET,
    LOAD_CHATS_LIST,
    ADD_CHAT_MSG
} from "../../actions/socketActions/const";

const initialState = {
    socketConnection: false,
    activeSocketModule: null,
    socketErrorStatus: null,
    chat: {
        chatToken: null,
        limitList: null,
        usersList: [],
        listdata: [],
        listdataMsgs: {}
    }
};

export default (state = initialState, action) => {
    switch (action.type) {

        case SET_SOCKET_CONNECTION: {
            const { payload: {
                activeModule = "chat",
                socketConnection = false
            } = {}
            } = action || {};

            return {
                ...state,
                activeSocketModule: activeModule,
                socketConnection
            }
        }

        case SET_ACTIVE_CHAT_TOKEN: {
            const { chat = {} } = state;
            const { tokenRoom, listdataMsgs = [] } = action.payload || {};

            return {
                ...state,
                chat: {
                    ...state.chat,
                    chatToken: tokenRoom || { chatToken: null },
                    listdataMsgs: {
                        ...chat.listdataMsgs,
                        [tokenRoom]: [...listdataMsgs]
                    }
                }
            };
        }

        case ADD_CHAT_MSG: {
            const { chat: { chatToken = "" } = {}, chat = {} } = state || {};
            const msg = action.payload;

            const messages = [...state.chat.listdataMsgs[chatToken]];

            const validMessages = messages.map(msgItem => {

                if (msgItem._id !== msg._id) {
                    return msgItem;
                }
                return null;
            }).filter(Boolean);

            return {
                ...state,
                chat: {
                    ...state.chat,
                    listdataMsgs: {
                        ...chat.listdataMsgs,
                        [chatToken]: [
                            ...validMessages,
                            { ...msg }
                        ]
                    }
                }
            }
        }

        case INVALID_LOAD_SOCKET: {
            const { msg, socketConnection } = action.payload || {};
            return {
                ...state,
                socketConnection,
                socketErrorStatus: msg
            }
        }

        case LOAD_CHATS_LIST: {

            const {
                usersList = [],
                listdata = [],
                options: {
                    socket: {
                        socketConnection = false,
                        module: activeSocketModule
                    } = {}
                } = {}
            } = action.payload || {};

            const sortListdata = [...listdata].sort((a, b) => Date(a.date) - Date(b.date));

            return {
                ...state,
                socketConnection,
                activeSocketModule,
                chat: {
                    ...state.chat,
                    usersList,
                    listdata: [...sortListdata]
                }

            };
        }

        default: {
            return state;
        }
    }
}