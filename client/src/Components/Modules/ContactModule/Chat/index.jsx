import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import _ from "lodash";
import io from 'socket.io-client';

import ChatMenu from "./ChatMenu";

import { notification, message } from "antd";

import { setSocketConnection, addMsg } from "../../../../Redux/actions/socketActions";
import { loadActiveChats, loadingDataByToken } from "../../../../Redux/actions/socketActions/middleware";

import Loader from "../../../Loader";
import ChatModal from "./ChatRoom/ChatModal";
import TitleModule from "../../../TitleModule";
import ChatRoom from "./ChatRoom";

import modelsContext from "../../../../Models/context";

class Chat extends React.PureComponent {

    state = {
        visible: null,
    };

    static contextType = modelsContext;

    socket = null;

    componentDidMount = () => {
        const {
            chat: {
                chatToken: tokenRoom = null,
                usersList = []
            } = {},
            udata: { _id: uid } = {},
            onSetActiveChatToken,
            onSetSocketConnection,
            onLoadActiveChats,
            onAddMsg = null
        } = this.props;

        this.socket = io("/");

        this.socket.on("reconnect_attempt", () => {
            this.socket.io.opts.transports = ["websocket", "polling"];
        });

        this.socket.on("connection", socketConnection => {
            if (socketConnection) {

                if (onLoadActiveChats)
                    onLoadActiveChats({
                        path: "loadChats",
                        actionPath: "chatRoom",
                        actionType: "entrypoint_chat",
                        options: {
                            limitList: null,
                            socket: {
                                socketConnection,
                                module: "chat"
                            },
                            tokenRoom,
                            uid
                        },
                    });

            } else {
                message.error("Соединение не установлено, попытка восстановить соединение.");
            }
        });

        this.socket.on("msg", ((msgObj) => {

            if (_.isObject(msgObj)) onAddMsg(msgObj);

        }));

        this.socket.on("initialUpdateFakeRoom", data => {
            const { id = "", membersIds = [], token = "" } = data || {};

            if (!id || !membersIds || !token) return;
            debugger;
            this.setActiveChatRoom({}, id, membersIds = [], token = "");
        });

        this.socket.on("error", () => {
            console.log("ws error");
            onSetSocketConnection({ socketConnection: false, activeModule: "chat" });
        });

    };

    componentDidUpdate = (prevProps, prevState) => {
        const {
            socketConnection,
            tokenRoom = "",
            activeSocketModule = null,
            onSetSocketConnection,
            onLoadActiveChats,
            chat: { usersList = [] } = {},
            udata: { _id: uid } = {},
        } = this.props;
        const { shouldUpdate = false } = this.state;
        if (prevProps.socketConnection && !socketConnection) {
            onSetSocketConnection({ socketConnection: false, module: null });
            return;
        }

        if (prevProps.tokenRoom !== tokenRoom && !_.isNull(prevProps.tokenRoom) || shouldUpdate) {
            if (onLoadActiveChats)
                onLoadActiveChats({
                    path: "loadChats",
                    actionPath: "chatRoom",
                    actionType: "entrypoint_chat",
                    options: {
                        limitList: null,
                        socket: {
                            socketConnection,
                            module: "chat"
                        },
                        tokenRoom: null,
                        uid
                    },
                });

            if (shouldUpdate) {
                this.setState({
                    shouldUpdate: false
                });
            }

        }
    }

    onCreateRoom = event => {
        this.setState({
            ...this.state,
            visible: true
        });
    };

    onClearScroll = evt => {
        const { shouldScroll = false } = this.state;

        if (shouldScroll)
            this.setState({
                shouldScroll: false
            })
    };

    pushMessage = (event, msg) => {
        const {
            interlocutorIdFakeRoom = null,
            chat: { chatToken: tokenRoom = "", group = "" } = {},
            udata: { displayName, _id: authorId = "" } = {}
        } = this.props;


        if (_.isNull(tokenRoom)) {
            return notification.error({ message: "Ошибка чата", description: "Данные повреждены." });
        }



        if (!msg) return message.error("Недопустимые значения или вы ничего не ввели.");

        const parseMsg = {
            authorId,
            tokenRoom: tokenRoom.split("__fake")[0],
            displayName,
            date: moment().format("DD.MM.YYYY HH:mm:ss"),
            groupName: group,
            moduleName: "chat",
            groupName: "single",
            msg
        };

        if (tokenRoom.includes("__fakeRoom") && interlocutorIdFakeRoom) {

            const interlocutorId = interlocutorIdFakeRoom;

            this.socket.emit("initFakeRoom", { fakeMsg: parseMsg, interlocutorId });
            return;
        }

        this.socket.emit("newMessage", parseMsg);
    };

    setActiveChatRoom = (event, id, membersIds = [], token = "") => {
        const {
            chat: {
                chatToken = null,
                listdata = [],
            } = {},
            udata: { displayName = "" } = {},
            onLoadingDataByToken = null
        } = this.props;
        debugger;
        if (id < 0) {
            onLoadingDataByToken(token, listdata, "chat", membersIds[1]);
            return;
        }

        if (chatToken !== token || !token) {

            if (onLoadingDataByToken) {
                onLoadingDataByToken(token, listdata, "chat");
                this.socket.emit("onChatRoomActive", { token, displayName });
            }

        } else if (!token)
            message.warning("Чат комната не найдена либо требуется обновить систему.");
    };

    onVisibleChange = (visible, shouldUpdate) => {
        this.setState({
            ...this.state,
            shouldUpdate: true,
            visible: !visible
        });
    };

    renderModal = visible => {
        const {
            chat: {
                usersList = [],
                listdata = [],
            } = {},
            udata: { _id: uid } = {},
            onSetActiveChatToken,
            onLoadActiveChats,
        } = this.props;

        const { Request = null } = this.context;

        return (
            <ChatModal
                onVisibleChange={this.onVisibleChange}
                visible={visible}
                usersList={usersList}
                uid={uid}
                listdata={listdata}
                onLoadActiveChats={onLoadActiveChats}
                onSetActiveChatToken={onSetActiveChatToken}
                Request={Request}
            />
        );
    };

    parseChatJson = ({ type, mode = "displayName", item = {} }) => {
        const { membersIds = [], groupName = "" } = item || {};

        const {
            chat: {
                usersList = [],
            } = {},
        } = this.props;

        if (Array.isArray(membersIds) && !membersIds.length || !membersIds) {
            return null;
        }

        if (type === "single") {

            if (membersIds.length < 2) return null;

            const InterlocutorId = membersIds[1];
            const Interlocutor = usersList.find(user => user._id === InterlocutorId) || {};

            const { [mode]: field = "" } = Interlocutor || {};
            return field;
        }

        if (type === "group") return groupName;

    };

    render() {
        const { visible, shouldScroll = false } = this.state;
        const {
            chat: {
                listdata,
                usersList = [],
                listdataMsgs = [],
                chatToken: tokenRoom = null
            } = {},
            udata: { _id: uid = "" } = {},
            socketConnection,
            socketErrorStatus
        } = this.props;

        return (
            <div className="chat">
                <TitleModule classNameTitle="ContactModule__chatTitle" title="Корпоративный чат" />
                {this.renderModal(visible)}
                <div className="chat__main">
                    <ChatMenu
                        uid={uid}
                        socketConnection={socketConnection}
                        socketErrorStatus={socketErrorStatus}
                        listdata={listdata}
                        usersList={usersList}
                        tokenRoom={tokenRoom}
                        setActiveChatRoom={this.setActiveChatRoom}
                        parseChatJson={this.parseChatJson}
                        onCreateRoom={this.onCreateRoom}
                    />
                    <div className="col-chat-content">
                        <div className="chat_content">
                            <div className="chat_content__header">
                                <p className="chat_content__header__title">
                                    Окно чата{tokenRoom ? <span> | {tokenRoom} </span> : null}
                                </p>
                                <p
                                    className={[
                                        "chat_content__header__statusChat",
                                        !socketConnection ? "isOffline" : "isOnline"
                                    ].join(" ")}
                                >
                                    {!socketConnection && !tokenRoom ? "не активен" : "активен"}
                                </p>
                            </div>
                            <div className="chat_content__main">
                                {!socketConnection && !socketErrorStatus ? (
                                    <Loader />
                                ) : tokenRoom ? (
                                    <ChatRoom
                                        key={tokenRoom}
                                        uid={uid.trim()}
                                        onClearScroll={this.onClearScroll}
                                        shouldScroll={shouldScroll}
                                        onKeyDown={this.pushMessage}
                                        tokenRoom={tokenRoom}
                                        listdata={listdata}
                                        pushMessage={this.pushMessage}
                                        messages={listdataMsgs[tokenRoom] || []}
                                    />
                                ) : (
                                            <div className="emptyChatRoom">
                                                {!socketErrorStatus ?
                                                    <p className="emptyChatRoomMsg">Выберите собеседника</p>
                                                    :
                                                    <p className="socket-error">{socketErrorStatus}</p>
                                                }
                                            </div>
                                        )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    const {
        chat = {},
        chat: { chatToken: tokenRoom = null, isFake: interlocutorIdFakeRoom = null } = {},
        socketConnection = false,
        activeSocketModule = null,
        socketErrorStatus = null
    } = state.socketReducer;

    const { udata = {} } = state.publicReducer;

    return {
        chat,
        socketConnection,
        activeSocketModule,
        socketErrorStatus,
        tokenRoom,
        udata,
        interlocutorIdFakeRoom
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onAddMsg: async payload => dispatch(addMsg(payload)),
        onLoadActiveChats: async payload => dispatch(loadActiveChats(payload)),
        onSetSocketConnection: status => dispatch(setSocketConnection(status)),
        onLoadingDataByToken: (token, listdata, moduleName, isFake) => {
            dispatch(loadingDataByToken(token, listdata, moduleName, isFake))
        }
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
