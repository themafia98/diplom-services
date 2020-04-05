import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import { Skeleton, List, Avatar, Button } from 'antd';
import uuid from 'uuid';

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
    uid = '',
    setActiveChatRoom,
  } = props || {};

  const [iDs, setIDs] = useState([]);
  const [rooms, updateRooms] = useState([]);

  const generateSkeleton = (counter = 5) => {
    return _.fill(Array(counter), '-_-').map((it, i) => {
      return (
        <div className="item-skeleton" key={`${it}${i}`}>
          <Skeleton loading={true} active avatar paragraph={false}>
            <Meta />
          </Skeleton>
        </div>
      );
    });
  };

  useEffect(() => {
    const ids = [];
    let i = usersList.length > iDs.length ? iDs.length - 1 : 0;

    for (i; i < usersList.length; i++) {
      ids.push(uuid());
    }

    setIDs(ids);
  }, [usersList.length, iDs.length]);

  useEffect(() => {
    const singleRooms = listdata.filter(room => room.type === 'single');

    const rooms = [];
    for (let j = 0; j < usersList.length; j++) {
      const user = usersList[j];

      const room = singleRooms.find(room => room.membersIds.includes(user._id)) || null;

      if (!room) {
        rooms.push({
          _id: ~~(Math.random() * -10000000),
          type: 'single',
          moduleName: 'chat',
          tokenRoom: iDs[j],
          membersIds: uid !== user._id ? [uid, user._id] : [null],
        });
        continue;
      }
    }

    updateRooms([...singleRooms, ...rooms]);
  }, [usersList, listdata, iDs, uid]);

  return (
    <div className="col-chat-menu">
      <div className="menuLoading-skeleton">
        <Scrollbars>
          {!socketConnection && !socketErrorStatus ? (
            generateSkeleton(listdata && listdata.length ? listdata.length : 5)
          ) : (
            <List
              key="list-chat"
              dataSource={rooms}
              renderItem={(it, i) => {
                const { membersIds = [], type } = it || {};

                const displayName = parseChatJson({ type, item: it, mode: 'displayName' });

                const descriptionChatMenu = false ? (
                  <span className="descriptionChatMenu">{/* lastMsg */}</span>
                ) : (
                  <span className="descriptionChatMenu"></span>
                );

                return (
                  <Item
                    className={clsx(tokenRoom === it.tokenRoom ? 'activeChat' : null)}
                    onClick={e => setActiveChatRoom(e, it._id, membersIds, it.tokenRoom)}
                    key={it._id + i}
                  >
                    <Meta
                      key={`${it}${i}`}
                      avatar={<Avatar shape="square" size="large" icon="user" />}
                      title={<p>{`${displayName}`}</p>}
                      description={descriptionChatMenu}
                    />
                  </Item>
                );
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
