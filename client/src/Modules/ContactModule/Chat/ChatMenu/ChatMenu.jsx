import React, { useEffect, useState } from 'react';
import { chatMenuType } from '../../ContactModule.types';
import clsx from 'clsx';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import { Skeleton, List, Avatar, Button } from 'antd';
import { v4 as uuid } from 'uuid';
import { withClientDb } from 'Models/ClientSideDatabase';

const { Item: { Meta } = {}, Item = {} } = List || {};

const ChatMenu = ({
  socketConnection,
  socketErrorStatus,
  listdata,
  usersList,
  tokenRoom,
  parseChatJson,
  onCreateRoom,
  uid,
  setActiveChatRoom,
  type,
  clientDB,
  isWs,
}) => {
  const [iDs, setIDs] = useState([]);
  const [visible, setVisible] = useState(false);
  const [rooms, updateRooms] = useState([]);

  const generateSkeleton = (counter = 5) => {
    if (!isWs) return null;
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

  const onOpenMenu = () => {
    setVisible(!visible);
  };

  useEffect(() => {
    const ids = [];
    if (!isWs) return;
    let i = usersList.length > iDs.length ? iDs.length - 1 : 0;

    for (i; i < usersList.length; i++) {
      ids.push(uuid());
    }

    setIDs(ids);
  }, [usersList.length, iDs.length, isWs]);

  useEffect(() => {
    if (!isWs) return;
    let tmpRoomCounter = 0;
    updateRooms(
      [...listdata, ...usersList].reduce((roomsList, item) => {
        const isRoom = item && !!item?.tokenRoom;
        if (isRoom) return [...roomsList, item];

        if (roomsList.some((it) => it?.type === 'single' && it?.membersIds.includes(item?._id))) {
          return roomsList;
        }

        const tmp = {
          _id: ~~(Math.random() * -10000000),
          type: 'single',
          moduleName: 'chat',
          tokenRoom: iDs[tmpRoomCounter],
          membersIds: uid !== item._id ? [uid, item._id] : [null],
        };

        tmpRoomCounter += 1;
        return [...roomsList, tmp];
      }, []),
      clientDB,
    );
  }, [usersList, listdata, iDs, uid, isWs, clientDB]);

  return (
    <>
      {type !== 'modal' ? null : isWs ? (
        <Button type="primary" className="openMenu-button" onClick={onOpenMenu}>
          {!visible ? 'Открыть комнаты' : 'Скрыть комнаты'}
        </Button>
      ) : null}
      <div
        className={
          type !== 'modal'
            ? 'col-chat-menu'
            : clsx('col-chat-menu', visible ? 'chatMenu-visible' : 'chatMenu-hidden')
        }
      >
        <div className="menuLoading-skeleton">
          <Scrollbars autoHide hideTracksWhenNotNeeded>
            {!socketConnection && !socketErrorStatus && isWs ? (
              generateSkeleton(7)
            ) : isWs ? (
              <List
                key="list-chat"
                dataSource={rooms}
                renderItem={(it, i) => {
                  const { membersIds = [], type } = it || {};

                  const chatJson = parseChatJson({ type, item: it }) || {};
                  const { displayName = '', avatar = null } = chatJson || {};

                  return (
                    <Item
                      className={clsx(tokenRoom?.includes(it?.tokenRoom) ? 'activeChat' : null)}
                      onClick={(e) => setActiveChatRoom(e, it?._id, membersIds, it?.tokenRoom)}
                      key={i}
                    >
                      <Meta
                        key={`${i}-meta`}
                        avatar={
                          <Avatar
                            src={`data:image/png;base64,${avatar}`}
                            shape="square"
                            size={type === 'modal' ? 'default' : 'large'}
                            icon="user"
                          />
                        }
                        title={<p>{`${displayName}`}</p>}
                        description={<span className="descriptionChatMenu"></span>}
                      />
                    </Item>
                  );
                }}
              />
            ) : null}
          </Scrollbars>
        </div>
        {type !== 'modal' ? (
          <Button
            onClick={onCreateRoom}
            type="primary"
            disabled={!socketConnection || !isWs}
            className="chat_main__createRoom"
          >
            Создать комнату
          </Button>
        ) : null}
      </div>
    </>
  );
};

ChatMenu.defaultProps = {
  type: 'default',
  isWs: false,
  socketConnection: false,
  socketErrorStatus: '',
  listdata: [],
  usersList: [],
  tokenRoom: '',
  parseChatJson: null,
  onCreateRoom: null,
  uid: '',
  setActiveChatRoom: null,
};

ChatMenu.propTypes = chatMenuType;

export default withClientDb(ChatMenu);
