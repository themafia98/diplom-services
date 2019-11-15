import React from "react";
import moment from "moment";
import _ from "lodash";
import uuid from "uuid/v4";
import Scrollbars from "react-custom-scrollbars";
import { Skeleton, List, Avatar, Button, notification, message } from "antd";

import Loader from "../../../Loader";
import TitleModule from "../../../TitleModule";
import ChatRoom from "./ChatRoom";

class Chat extends React.PureComponent {
    state = {
        isLoad: false,
        roomToken: null,
        listdata: []
    };

    timer = null;

    componentDidMount = () => {
        this.timer = setTimeout(() => {
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

        if (Array.isArray(listdata) && !_.isEmpty(listdata))
            this.setState({
                ...this.state,
                listdata: [
                    ...listdata,
                    {
                        id: listdata[listdata.length - 1].id + 1,
                        roomToken: roomToken,
                        name: "Павел Петрович",
                        link: "/themafia98",
                        msg: msg,
                        date: moment()
                    }
                ]
            });
    };

    setActiveChatRoom = event => {
        const token = uuid();
        this.setState({
            ...this.state,
            listdata: [
                ...this.state.listdata,
                {
                    id: 1,
                    roomToken: token,
                    name: "Павел Петрович",
                    link: "/themafia98",
                    msg: "Привет!",
                    date: moment()
                },
                {
                    id: 2,
                    roomToken: token,
                    name: "Гена Букин",
                    link: "/gena228",
                    msg: "И тебе привет!",
                    date: moment()
                }
            ],
            roomToken: token
        });
    };

    render() {
        const demoMenu = _.fill(Array(2), "demo");
        const { isLoad = false, roomToken = null, listdata = [] } = this.state;

        return (
            <div className="chat">
                <TitleModule classNameTitle="ContactModule__chatTitle" title="Корпоративный чат" />
                <div className="chat__main">
                    <div className="col-chat-menu">
                        <div className="menuLoading-skeleton">
                            <Scrollbars>
                                {!isLoad ? (
                                    demoMenu.map((it, i) => (
                                        <div className="item-skeleton" key={`${it}${i}`}>
                                            <Skeleton loading={true} active avatar paragraph={false}>
                                                <List.Item.Meta />
                                            </Skeleton>
                                        </div>
                                    ))
                                ) : (
                                    <List
                                        key="list-chat"
                                        dataSource={demoMenu}
                                        renderItem={(it, i) => (
                                            <List.Item onClick={this.setActiveChatRoom} key={(it, i)}>
                                                <List.Item.Meta
                                                    key={`${it}${i}`}
                                                    avatar={<Avatar shape="square" size="large" icon="user" />}
                                                    title={<p>{`${it}${i}_person`}</p>}
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
                                <p className="chat_content__header__title">Окно чата</p>
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
export default Chat;
