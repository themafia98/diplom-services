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
        status: false
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
            return {
                ...state,
                chat: {
                    ...state.chat,
                    chatToken: action.payload.token || { chatToken: null },
                    listdata: action.payload.listdata ? [...action.payload.listdata] : [],
                    status: true,
                }
            };
        }

        case ADD_CHAT_MSG: {
            const msg = action.payload;
            return {
                ...state,
                chat: {
                    ...state.chat,
                    listdata: [...state.chat.listdata, { ...msg }]
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

            return {
                ...state,
                socketConnection,
                activeSocketModule,
                chat: {
                    ...state.chat,
                    usersList,
                    listdata: [...listdata]
                }

            };
        }

        default: {
            return state;
        }
    }
}