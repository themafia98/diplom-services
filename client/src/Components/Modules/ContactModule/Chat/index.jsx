import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import _ from "lodash";
import io from 'socket.io-client';
import uuid from "uuid/v4";
import Scrollbars from "react-custom-scrollbars";
import { Skeleton, List, Avatar, Button, notification, message } from "antd";

import { setActiveChatToken, setSocketConnection } from "../../../../Redux/actions/socketActions";
import { loadActiveChats } from "../../../../Redux/actions/socketActions/middleware";

import Loader from "../../../Loader";
import ChatModal from "./ChatRoom/ChatModal";
import TitleModule from "../../../TitleModule";
import ChatRoom from "./ChatRoom";


class Chat extends React.PureComponent {

    state = {
        messages: [],
        visible: null,
        isStart: false,
    };

    socket = null;
    timer = null;

    componentDidMount = () => {
        const { messages = [] } = this.state;
        const {
            chat: { chatToken = null } = {},
            onSetActiveChatToken,
            onSetSocketConnection,
            onLoadActiveChats
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
                        action: "entrypoint_chat",
                        options: {
                            limitList: null,
                            socket: {
                                socketConnection,
                                module: "chat"
                            }
                        },
                    });

            } else messages.error("Соединение не установлено, попытка восстановить соединение.");
        });

        this.socket.on("msg", ((msgObj) => {
            if (_.isObject(msgObj)) {
                this.setState({
                    ...this.state,
                    messages: [...this.state.messages, { ...msgObj }]
                });
            }
        }));

        this.socket.on("joinMsg", ({ displayName, tokenRoom }) => {
            this.setState({
                ...this.state,
                messages: [...this.state.messages, {
                    tokenRoom,
                    displayName,
                    msg: `New user join to room ${tokenRoom}`
                }]
            })
        });

        this.socket.on("error", () => {
            console.log("there was an error");
        });

        // if (!_.isNull(chatToken))
        //     onSetActiveChatToken(123, []);
    };

    componentDidUpdate = (prevProps, prevState) => {
        const { socketConnection, activeSocketModule = null, onSetSocketConnection } = this.props;

        if (prevProps.socketConnection && !socketConnection) {
            onSetSocketConnection({ socketConnection: false, module: null });
            return;
        }
    }

    componentWillUnmount = () => {
        if (this.timer) clearTimeout(this.timer);
    };

    onCreateRoom = event => {
        this.setState({
            ...this.state,
            visible: true
        });
    };

    pushMessage = (event, msg) => {
        const { chat: { chatToken: tokenRoom = "" } = {}, udata: { displayName } = {} } = this.props;

        console.log("push");
        if (_.isNull(tokenRoom)) {
            return notification.error({ message: "Ошибка чата", description: "Данные повреждены." });
        }

        if (!msg) return message.error("Недопустимые значения или вы ничего не ввели.");

        this.socket.emit("newMessage",
            {
                tokenRoom,
                displayName,
                msg
            });
    };

    setActiveChatRoom = (event, token = "") => {
        const {
            chat: {
                chatToken = null,
                listdata: listdataMsgs = {}
            } = {},
            udata: { displayName = "" } = {},
            onSetActiveChatToken = null
        } = this.props;

        if (chatToken !== token || !token) {

            const listdata = [...listdataMsgs];

            if (onSetActiveChatToken) {
                onSetActiveChatToken(token, listdata);
                this.socket.emit("onChatRoomActive", { token, displayName });
            }

        } else if (!token)
            message.warning("Чат комната не найдена либо требуется обновить систему.");
    };

    onVisibleChange = visible => {
        this.setState({
            ...this.state,
            visible: !visible
        });
    };

    renderModal = visible => {
        return <ChatModal onVisibleChange={this.onVisibleChange} visible={visible} />;
    };

    render() {
        const { messages = [], visible, isStart = false } = this.state;
        const {
            chat: {
                listdata,
                usersList = [],
                chatToken: roomToken = null
            } = {},
            udata: { _id: currentUserId = "" } = {},
            socketConnection,
            socketErrorStatus
        } = this.props;

        return (
            <div className="chat">
                <TitleModule classNameTitle="ContactModule__chatTitle" title="Корпоративный чат" />
                {this.renderModal(visible)}
                <div className="chat__main">
                    <div className="col-chat-menu">
                        <div className="menuLoading-skeleton">
                            <Scrollbars>
                                {!socketConnection && !socketErrorStatus ? (
                                    messages.length ? messages.map((it, i) => (
                                        <div className="item-skeleton" key={`${it}${i}`}>
                                            <Skeleton loading={true} active avatar paragraph={false}>
                                                <List.Item.Meta />
                                            </Skeleton>
                                        </div>
                                    )) : (
                                            _.fill(Array(5), "-_-").map((it, i) => {
                                                return (
                                                    <div className="item-skeleton" key={`${it}${i}`}>
                                                        <Skeleton
                                                            loading={true}
                                                            active
                                                            avatar
                                                            paragraph={false}
                                                        >
                                                            <List.Item.Meta />
                                                        </Skeleton>
                                                    </div>
                                                )
                                            })
                                        )
                                ) : (
                                        <List
                                            key="list-chat"
                                            dataSource={usersList.filter(it => it._id !== currentUserId)}
                                            renderItem={(it, i) => (
                                                <List.Item
                                                    className={[roomToken === it.id ? "activeChat" : null].join(" ")}
                                                    onClick={e => this.setActiveChatRoom(e, it._id)}
                                                    key={(it, i)}
                                                >
                                                    <List.Item.Meta
                                                        key={`${it}${i}`}
                                                        avatar={<Avatar shape="square" size="large" icon="user" />}
                                                        title={<p>{`${it.displayName}`}</p>}
                                                        description={
                                                            <span className="descriptionChatMenu">
                                                                A second stack is created, pulling 3 values from the first
                                                                stack.
                                                        </span>
                                                        }
                                                    />
                                                </List.Item>
                                            )}
                                        />
                                    )}
                            </Scrollbars>
                        </div>
                        <Button
                            onClick={this.onCreateRoom}
                            type="primary"
                            disabled={!socketConnection}
                            className="chat_main__createRoom"
                        >
                            Создать комнату
                        </Button>
                    </div>
                    <div className="col-chat-content">
                        <div className="chat_content">
                            <div className="chat_content__header">
                                <p className="chat_content__header__title">
                                    Окно чата{roomToken ? <span> | {roomToken} </span> : null}
                                </p>
                                <p
                                    className={[
                                        "chat_content__header__statusChat",
                                        !socketConnection ? "isOffline" : "isOnline"
                                    ].join(" ")}
                                >
                                    {!socketConnection && !roomToken ? "не активен" : "активен"}
                                </p>
                            </div>
                            <div className="chat_content__main">
                                {!socketConnection && !socketErrorStatus ? (
                                    <Loader />
                                ) : roomToken ? (
                                    <ChatRoom
                                        key={roomToken}
                                        onKeyDown={this.pushMessage}
                                        roomToken={roomToken}
                                        listdata={listdata}
                                        pushMessage={this.pushMessage}
                                        messages={this.state.messages}
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
        udata
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onLoadActiveChats: async payload => await dispatch(loadActiveChats(payload)),
        onSetSocketConnection: status => dispatch(setSocketConnection(status)),
        onSetActiveChatToken: async (token, listdata) => await dispatch(setActiveChatToken({ token, listdata }))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
