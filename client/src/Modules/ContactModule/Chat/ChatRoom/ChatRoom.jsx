import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatRoomType } from '../../types';
import clsx from 'clsx';
import Scrollbars from 'react-custom-scrollbars';
import { Button, Avatar } from 'antd';

import Textarea from 'Components/Textarea';
import Message from './Message';

const ChatRoom = ({
  uid,
  shouldScroll,
  messagesLength,
  messages: msgProps,
  usersList,
  tokenRoom,
  onClearScroll,
  onKeyDown,
  pushMessage,
  myAvatar,
}) => {
  const refScrollbar = useRef(null);
  const [isMount, setMount] = useState(false);
  const [token] = useState(tokenRoom);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState(msgProps);

  const redirectUserProfile = (event, link) => {
    console.log(link);
  };

  const scrollHandler = useCallback(
    (event) => {
      const { current: scrollNode = null } = refScrollbar || {};
      if (!scrollNode) return;

      if (!event) {
        refScrollbar.current.scrollToBottom();
        return;
      }

      const { top: positionX } = scrollNode.getValues();

      if (event && onClearScroll && positionX >= 0.9) {
        refScrollbar.current.scrollToBottom();
        onClearScroll();
      }
    },
    [refScrollbar, onClearScroll],
  );

  useEffect(() => {
    if (messages.length !== msgProps.length) setMessages([...msgProps]);

    if (messages && messages.length) {
      scrollHandler(messages[messages.length - 1].authorId !== uid);
    }
  }, [messages, msgProps, scrollHandler, uid]);

  useEffect(() => {
    if (isMount) return;
    scrollHandler();
    setMount(true);
  }, [isMount, scrollHandler]);

  useEffect(() => {
    if (shouldScroll) scrollHandler(true);
  }, [messagesLength, shouldScroll, scrollHandler]);

  const onChange = (event) => {
    const { currentTarget: { value = '' } = {} } = event;
    if (value !== msg) setMsg(value);
  };

  const onSubmit = (event, msgValue = null) => {
    if (msgValue === null) {
      if ((event.which || event.keyCode) && (event.which || event.keyCode) !== 13) return;
      if ((event.which || event.keyCode) && (event.which || event.keyCode) === 13) {
        event.preventDefault();
      }
      onKeyDown(event, msgValue ? msgValue : msg);
      setMsg('');
    } else if (event && msgValue !== null) {
      pushMessage(event, msgValue);
      setMsg('');
    }
    scrollHandler();
  };

  const renderChat = (messages) => {
    return messages.map((it, i) => {
      const isMine = uid === it.authorId && uid.includes(it.authorId);

      const avatar = isMine ? myAvatar : usersList.find((user) => user?._id === it?.authorId)?.avatar;

      const classNames = clsx(i, 'message', isMine ? 'currentUser' : null);
      return (
        <div
          key={`${i}${it.tokenRoom}${it.msg}${it.authorId}${it.displayName}${it._id}`}
          className={classNames}
        >
          <Message
            it={it.msg}
            key={`msg_${i}${it.tokenRoom}${it.msg}${it.authorId}${it.displayName}${it._id}`}
            className="flex-wrapper"
          >
            <>
              <div className="msg_header">
                {it.displayName !== 'System' ? (
                  <span
                    onClick={(event) => redirectUserProfile(event, it.authorId ? it.authorId : null)}
                    className="msg_author"
                  >
                    <Avatar src={`data:image/png;base64,${avatar}`} size="default" />
                    <span className="displayName">{it.displayName}</span>
                  </span>
                ) : (
                  <p className="admin_wrapper">{it.displayName}</p>
                )}

                {it.displayName !== 'System' ? (
                  <span className="msg_date">{it.date ? it.date : 'No date'}.</span>
                ) : null}
              </div>
              <p className="wrapper_msg">{it.msg}</p>
            </>
          </Message>
        </div>
      );
    });
  };

  return (
    <div key={token} className="chatRoom">
      <div className="chatWindow">
        <div id="containerChat">
          <Scrollbars hideTracksWhenNotNeeded={true} ref={refScrollbar}>
            <div className="flex-group">{renderChat(messages)}</div>
          </Scrollbars>
        </div>
      </div>
      <Textarea value={msg} onChange={onChange} onKeyDown={onSubmit} className="chat-area" />
      <Button onClick={(event) => onSubmit(event, msg)} type="primary">
        Отправить
      </Button>
    </div>
  );
};

ChatRoom.defaultProps = {
  uid: '',
  shouldScroll: false,
  messagesLength: 0,
  messages: [],
  usersList: [],
  tokenRoom: '',
  onClearScroll: null,
  onKeyDown: null,
  pushMessage: null,
  myAvatar: '',
};

ChatRoom.propTypes = chatRoomType;

export default ChatRoom;
