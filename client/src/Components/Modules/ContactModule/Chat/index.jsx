import React from "react";
import _ from "lodash";
import Scrollbars from "react-custom-scrollbars";
import { Skeleton, List, Avatar, Button } from "antd";

import TitleModule from "../../../TitleModule";

class Chat extends React.PureComponent {
    state = {
        isLoad: false
    };

    timer = null;

    componentDidMount = () => {
        this.timer = setTimeout(() => {
            this.setState({
                ...this.state,
                isLoad: true
            });
        }, 5000);
    };

    componentWillUnmount = () => {
        if (this.timer) clearTimeout(this.timer);
    };

    render() {
        const demoMenu = _.fill(Array(20), "demo");
        const { isLoad = false } = this.state;
        return (
            <div className="chat">
                <TitleModule classNameTitle="ContactModule__chatTitle" title="Корпоративный чат" />
                <div className="chat__main">
                    <div className="col-chat-menu">
                        <div className="menuLoading-skeleton">
                            <Scrollbars>
                                {!isLoad ? (
                                    demoMenu.map(it => (
                                        <div className="item-skeleton" key={it + Math.random()}>
                                            <Skeleton loading={true} active avatar paragraph={false}>
                                                <List.Item.Meta />
                                            </Skeleton>
                                        </div>
                                    ))
                                ) : (
                                    <List
                                        key={Math.random()}
                                        dataSource={demoMenu}
                                        renderItem={it => (
                                            <List.Item key={it + Math.random()}>
                                                <List.Item.Meta
                                                    key={it + Math.random()}
                                                    avatar={<Avatar shape="square" size="large" icon="user" />}
                                                    title={<p>{it + Math.random()}</p>}
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
                            <div className="chat_content__header">Chat header</div>
                            <div className="chat_content__main">
                                <p>{!isLoad ? "Loading" : "Chat main"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default Chat;
