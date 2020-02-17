import React from 'react';
import _ from 'lodash';
import Scrollbars from "react-custom-scrollbars";
import { Skeleton, List, Avatar, Button } from 'antd';

const { Item: { Meta } = {}, Item = {} } = List || {};

const ChatMenu = props => {

    const {
        socketConnection,
        socketErrorStatus,
        listdata,
        usersList,
        tokenRoom,
        parseChatJson = null,
        onCreateRoom = null,
        setActiveChatRoom
    } = props || {};

    const generateSkeleton = (counter = 5) => {
        return _.fill(Array(counter), "-_-").map((it, i) => {
            return (
                <div className="item-skeleton" key={`${it}${i}`}>
                    <Skeleton
                        loading={true}
                        active
                        avatar
                        paragraph={false}
                    >
                        <Meta />
                    </Skeleton>
                </div>
            )
        });
    }

    return (
        <div className="col-chat-menu">
            <div className="menuLoading-skeleton">
                <Scrollbars>
                    {!socketConnection && !socketErrorStatus ? (
                        generateSkeleton(listdata && listdata.length ? listdata.length : 5)
                    ) : (
                            <List
                                key="list-chat"
                                dataSource={listdata}
                                renderItem={(it, i) => {
                                    const { membersIds = [], type } = it || {};


                                    const displayName = parseChatJson({
                                        type,
                                        membersIds,
                                        mode: "displayName"
                                    });

                                    const descriptionChatMenu = false ? (
                                        <span className="descriptionChatMenu">
                                            {/* lastMsg */}
                                        </span>
                                    ) : (
                                            <span className="descriptionChatMenu">

                                            </span>
                                        )

                                    return (
                                        <Item
                                            className={[tokenRoom === it.tokenRoom ? "activeChat" : null].join(" ")}
                                            onClick={e => setActiveChatRoom(e, it.tokenRoom)}
                                            key={(it, i)}
                                        >
                                            <Meta
                                                key={`${it}${i}`}
                                                avatar={<Avatar shape="square" size="large" icon="user" />}
                                                title={<p>{`${displayName}`}</p>}
                                                description={descriptionChatMenu}
                                            />
                                        </Item>
                                    )
                                }}
                            />
                        )}
                </Scrollbars>
            </div>
            <Button
                onClick={onCreateRoom}
                type="primary"
                disabled={!socketConnection}
                className="chat_main__createRoom"
            >
                Создать комнату
            </Button>
        </div>
    );
};

export default ChatMenu;