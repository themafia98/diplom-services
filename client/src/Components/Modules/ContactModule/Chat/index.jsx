import React from "react";
import _ from "lodash";
import uuid from "uuid/v4";
import Scrollbars from "react-custom-scrollbars";
import { Skeleton, List, Avatar, Button } from "antd";

import Loader from "../../../Loader";
import TitleModule from "../../../TitleModule";
import ChatRoom from "./ChatRoom";

class Chat extends React.PureComponent {
    state = {
        isLoad: false,
        roomToken: null
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

    onSend = event => {};

    setActiveChatRoom = event => {
        this.setState({
            ...this.state,
            roomToken: uuid()
        });
    };

    render() {
        const demoMenu = _.fill(Array(20), "demo");
        const { isLoad = false, roomToken = null } = this.state;
        const listdata = [
            { id: 1, roomToken: roomToken, name: "Павел Петрович", link: "/themafia98", msg: "Привет!" },
            { id: 2, roomToken: roomToken, name: "Гена Букин", link: "/gena228", msg: "И тебе привет!" }
        ];

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
                                    <ChatRoom roomToken={roomToken} listdata={listdata} onSend={this.onSend} />
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
