import { SET_ACTIVE_CHAT_TOKEN, SET_SOCKET_CONNECTION } from "../../actions/socketActions/const";

const initialState = {
    socketConnection: false,
    activeSocketModule: null,
    chat: {
        chatToken: null,
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

        default: {
            return state;
        }
    }
}