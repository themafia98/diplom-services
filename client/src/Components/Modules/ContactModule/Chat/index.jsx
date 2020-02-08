import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import _ from "lodash";
import io from 'socket.io-client';

import Scrollbars from "react-custom-scrollbars";
import { Skeleton, List, Avatar, Button, notification, message } from "antd";

import { setActiveChatToken, setSocketConnection, addMsg } from "../../../../Redux/actions/socketActions";
import { loadActiveChats } from "../../../../Redux/actions/socketActions/middleware";

import Loader from "../../../Loader";
import ChatModal from "./ChatRoom/ChatModal";
import TitleModule from "../../../TitleModule";
import ChatRoom from "./ChatRoom";


class Chat extends React.PureComponent {

    state = {
        visible: null,
    };

    socket = null;

    componentDidMount = () => {
        const {
            chat: {
                chatToken: tokenRoom = null,
                listdata = []
            } = {},
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
                        action: "entrypoint_chat",
                        update: true,
                        options: {
                            limitList: null,
                            socket: {
                                socketConnection,
                                module: "chat"
                            },
                            tokenRoom
                        },
                    });

            } else {
                message.error("Соединение не установлено, попытка восстановить соединение.");
            }
        });

        this.socket.on("msg", ((msgObj) => {

            if (_.isObject(msgObj)) onAddMsg(msgObj);

        }));

        this.socket.on("error", () => {
            console.log("ws error");
        });

    };

    componentDidUpdate = (prevProps, prevState) => {
        const {
            socketConnection,
            tokenRoom = "",
            activeSocketModule = null,
            onSetSocketConnection,
            onLoadActiveChats
        } = this.props;

        if (prevProps.socketConnection && !socketConnection) {
            onSetSocketConnection({ socketConnection: false, module: null });
            return;
        }

        if (prevProps.tokenRoom !== tokenRoom &&
            _.isNull(prevProps.tokenRoom) && !_.isNull(tokenRoom)) {

            if (onLoadActiveChats)
                onLoadActiveChats({
                    path: "loadChats",
                    action: "entrypoint_chat",
                    options: {
                        limitList: null,
                        socket: {
                            socketConnection,
                            module: "chat"
                        },
                        tokenRoom: tokenRoom
                    },
                });

        }
    }

    onCreateRoom = event => {
        this.setState({
            ...this.state,
            visible: true
        });
    };

    pushMessage = (event, msg) => {
        const {
            chat: { chatToken: tokenRoom = "", group = "" } = {},
            udata: { displayName, _id: authorId = "" } = {}
        } = this.props;


        if (_.isNull(tokenRoom)) {
            return notification.error({ message: "Ошибка чата", description: "Данные повреждены." });
        }

        if (!msg) return message.error("Недопустимые значения или вы ничего не ввели.");

        this.socket.emit("newMessage",
            {
                authorId,
                tokenRoom,
                displayName,
                date: moment().format("DD:MM:YYY"),
                groupName: group,
                moduleName: "chat",
                groupName: "single",
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
        const { visible } = this.state;
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
                                    listdata.length ? listdata.map((it, i) => (
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
                                        messages={listdata}
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
        chat: { chatToken: tokenRoom = null } = {},
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
        udata
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onAddMsg: async payload => await dispatch(addMsg(payload)),
        onLoadActiveChats: async payload => await dispatch(loadActiveChats(payload)),
        onSetSocketConnection: status => dispatch(setSocketConnection(status)),
        onSetActiveChatToken: async (token, listdata) => await dispatch(setActiveChatToken({ token, listdata }))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
