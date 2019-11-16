import React from "react";
import { connect } from "react-redux";
import moment from "moment";
import _ from "lodash";
import uuid from "uuid/v4";
import Scrollbars from "react-custom-scrollbars";
import { Skeleton, List, Avatar, Button, notification, message } from "antd";

import { setActiveChatToken } from "../../../../Redux/actions/publicActions";
import Loader from "../../../Loader";
import TitleModule from "../../../TitleModule";
import ChatRoom from "./ChatRoom";

class Chat extends React.PureComponent {
    state = {
        isLoad: false,
        demoMessages: [
            { name: "Вася", id: uuid() },
            { name: "Гена Букин", id: uuid() }
        ]
    };

    timer = null;

    componentDidMount = () => {
        const { demoMessages = [] } = this.state;
        const { chat: { chatToken = null } = {}, onSetActiveChatToken } = this.props;
        this.timer = setTimeout(() => {
            if (!_.isNull(chatToken) && demoMessages.every(it => (it.id ? it.id !== chatToken : false))) {
                const listdata = [
                    {
                        id: 1,
                        roomToken: demoMessages[0].id,
                        name: "Павел Петрович",
                        link: "/themafia98",
                        msg: "Привет! code: " + Math.random(),
                        date: moment()
                    },
                    {
                        id: 2,
                        roomToken: demoMessages[0].id,
                        name: "Гена Букин",
                        link: "/gena228",
                        msg: "И тебе привет! code: " + Math.random(),
                        date: moment()
                    }
                ];
                onSetActiveChatToken(demoMessages[0].id, listdata);
            }
            this.setState({
                ...this.state,
                isLoad: true
            });
        }, 1500);
    };

    componentWillUnmount = () => {
        if (this.timer) clearTimeout(this.timer);
    };

    pushMessage = (event, msg) => {
        const { roomToken = "", listdata = null } = this.state;
        event.stopPropagation();
        if (_.isNull(roomToken)) {
            return notification.error({ message: "Ошибка чата", description: "Данные повреждены." });
        }

        if (!msg) return message.error("Недопустимые значения или вы ничего не ввели.");

        // if (Array.isArray(listdata) && !_.isEmpty(listdata))
        //     this.setState({
        //         ...this.state,
        //         listdata: [
        //             ...listdata,
        //             {
        //                 id: listdata[listdata.length - 1].id + 1,
        //                 roomToken: roomToken,
        //                 name: "Павел Петрович",
        //                 link: "/themafia98",
        //                 msg: msg,
        //                 date: moment()
        //             }
        //         ]
        //     });
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

    render() {
        const { isLoad = false, demoMessages } = this.state;
        const { chat: { listdata, chatToken: roomToken = null } = {} } = this.props;

        return (
            <div className="chat">
                <TitleModule classNameTitle="ContactModule__chatTitle" title="Корпоративный чат" />
                <div className="chat__main">
                    <div className="col-chat-menu">
                        <div className="menuLoading-skeleton">
                            <Scrollbars>
                                {!isLoad ? (
                                    demoMessages.map((it, i) => (
                                        <div className="item-skeleton" key={`${it}${i}`}>
                                            <Skeleton loading={true} active avatar paragraph={false}>
                                                <List.Item.Meta />
                                            </Skeleton>
                                        </div>
                                    ))
                                ) : (
                                    <List
                                        key="list-chat"
                                        dataSource={demoMessages}
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
                        <Button type="primary" disabled={!isLoad} className="chat_main__createRoom">
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
                                {!isLoad ? (
                                    <Loader />
                                ) : roomToken ? (
                                    <ChatRoom
                                        key={roomToken}
                                        onKeyDown={this.pushMessage}
                                        roomToken={roomToken}
                                        listdata={listdata}
                                        pushMessage={this.pushMessage}
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
    return {
        chat: state.publicReducer.chat
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onSetActiveChatToken: async (token, listdata) => await dispatch(setActiveChatToken({ token, listdata }))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
