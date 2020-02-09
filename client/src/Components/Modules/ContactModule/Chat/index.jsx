import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import _ from "lodash";
import io from 'socket.io-client';

import Scrollbars from "react-custom-scrollbars";
import { Skeleton, List, Avatar, Button, notification, message } from "antd";

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
                listdata = []
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
            onLoadActiveChats,
            udata: { _id: uid } = {},
        } = this.props;

        if (prevProps.socketConnection && !socketConnection) {
            onSetSocketConnection({ socketConnection: false, module: null });
            return;
        }

        if (prevProps.tokenRoom !== tokenRoom && !_.isNull(prevProps.tokenRoom)) {

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
                date: moment().format("DD.MM.YYYY"),
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
                listdata = [],
            } = {},
            udata: { displayName = "" } = {},
            onLoadingDataByToken = null
        } = this.props;

        if (chatToken !== token || !token) {

            if (onLoadingDataByToken) {
                onLoadingDataByToken(token, listdata, "chat");
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

    render() {
        const { visible } = this.state;
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
                    <div className="col-chat-menu">
                        <div className="menuLoading-skeleton">
                            <Scrollbars>
                                {!socketConnection && !socketErrorStatus ? (
                                    listdata.length ? listdata.map((it, i) => {
                                        return (
                                            <div className="item-skeleton" key={`${it}${i}`}>
                                                <Skeleton loading={true} active avatar paragraph={false}>
                                                    <List.Item.Meta />
                                                </Skeleton>
                                            </div>
                                        )
                                    }) : (
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
                                            dataSource={listdata}
                                            renderItem={(it, i) => {
                                                const displayName = it.membersIds ?
                                                    it.membersIds.reduce((name, current) => {
                                                        const currUser = usersList.find(it => it._id === current &&
                                                            it._id !== uid) || null;

                                                        if (currUser) {
                                                            const displayNames = `${name} ${currUser.displayName}`;
                                                            return displayNames;
                                                        }

                                                        return name;

                                                    }, "").trim() : null;

                                                //const msgs = listdataMsgs[tokenRoom] || null;
                                                // const isDefined = msgs ? Boolean(msgs[msgs.length - 1]) && msgs.length - 1 === i : null;
                                                // const lastMsg = msgs && isDefined && msgs[msgs.length - 1].msg ?
                                                //     msgs[msgs.length - 1].msg : null;

                                                const descriptionChatMenu = false ? (
                                                    <span className="descriptionChatMenu">
                                                        {/* lastMsg */}
                                                    </span>
                                                ) : (
                                                        <span className="descriptionChatMenu">

                                                        </span>
                                                    )

                                                return (
                                                    <List.Item
                                                        className={[tokenRoom === it.tokenRoom ? "activeChat" : null].join(" ")}
                                                        onClick={e => this.setActiveChatRoom(e, it.tokenRoom)}
                                                        key={(it, i)}
                                                    >
                                                        <List.Item.Meta
                                                            key={`${it}${i}`}
                                                            avatar={<Avatar shape="square" size="large" icon="user" />}
                                                            title={<p>{`${displayName}`}</p>}
                                                            description={descriptionChatMenu}
                                                        />
                                                    </List.Item>
                                                )
                                            }}
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
        onAddMsg: async payload => dispatch(addMsg(payload)),
        onLoadActiveChats: async payload => dispatch(loadActiveChats(payload)),
        onSetSocketConnection: status => dispatch(setSocketConnection(status)),
        onLoadingDataByToken: (token, listdata, moduleName) => dispatch(loadingDataByToken(token, listdata, moduleName))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
