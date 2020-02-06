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
                        type: null,
                        action: null,
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

        this.socket.on("msg", msg => {
            this.setState({
                messages: [...this.state.messages, msg]
            }, () => {

            });
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
        const { roomToken = "" } = this.state;

        console.log("push");
        if (_.isNull(roomToken)) {
            return notification.error({ message: "Ошибка чата", description: "Данные повреждены." });
        }

        if (!msg) return message.error("Недопустимые значения или вы ничего не ввели.");

        this.socket.emit("newMessage", msg);
    };

    setActiveChatRoom = (event, id = uuid()) => {
        const { chat: { chatToken = null } = {}, onSetActiveChatToken } = this.props;
        const token = id;

        if (chatToken !== id) {
            const listdata = [
                {
                    id: 1,
                    roomToken: token,
                    name: "Павел Петрович",
                    link: "/themafia98",
                    msg: "Привет! code: " + Math.random(),
                    date: moment()
                },
                {
                    id: 2,
                    roomToken: token,
                    name: "Гена Букин",
                    link: "/gena228",
                    msg: "Привет! code: " + Math.random(),
                    date: moment()
                }
            ];
            onSetActiveChatToken(id, listdata);
        } else return;
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
        const { isLoad = false, messages = [], visible, isStart = false } = this.state;
        const { chat: { listdata, chatToken: roomToken = null } = {}, socketConnection } = this.props;
        console.log(socketConnection);
        return (
            <div className="chat">
                <TitleModule classNameTitle="ContactModule__chatTitle" title="Корпоративный чат" />
                {this.renderModal(visible)}
                <div className="chat__main">
                    <div className="col-chat-menu">
                        <div className="menuLoading-skeleton">
                            <Scrollbars>
                                {!socketConnection ? (
                                    messages.map((it, i) => (
                                        <div className="item-skeleton" key={`${it}${i}`}>
                                            <Skeleton loading={true} active avatar paragraph={false}>
                                                <List.Item.Meta />
                                            </Skeleton>
                                        </div>
                                    ))
                                ) : (
                                        <List
                                            key="list-chat"
                                            dataSource={messages}
                                            renderItem={(it, i) => (
                                                <List.Item
                                                    className={[roomToken === it.id ? "activeChat" : null].join(" ")}
                                                    onClick={e => this.setActiveChatRoom(e, it.id)}
                                                    key={(it, i)}
                                                >
                                                    <List.Item.Meta
                                                        key={`${it}${i}`}
                                                        avatar={<Avatar shape="square" size="large" icon="user" />}
                                                        title={<p>{`${it.name}`}</p>}
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
                            disabled={!isLoad}
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
                                        !isLoad ? "isOffline" : "isOnline"
                                    ].join(" ")}
                                >
                                    {!isLoad ? "не активен" : "активен"}
                                </p>
                            </div>
                            <div className="chat_content__main">
                                {!socketConnection ? (
                                    <Loader />
                                ) : isStart ? (
                                    <ChatRoom
                                        key={roomToken}
                                        onKeyDown={this.pushMessage}
                                        roomToken={roomToken}
                                        listdata={listdata}
                                        pushMessage={this.pushMessage}
                                        listdata={this.state.messages}
                                    />
                                ) : (
                                            <div className="emptyChatRoom">
                                                <p className="emptyChatRoomMsg">Выберите собеседника</p>
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
        activeSocketModule = null
    } = state.socketReducer;

    return {
        chat,
        socketConnection,
        activeSocketModule
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
