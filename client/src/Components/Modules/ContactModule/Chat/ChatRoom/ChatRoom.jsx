import React, { useState, useRef, useEffect, useCallback } from 'react';
import _ from 'lodash';
import clsx from 'clsx';
import Scrollbars from 'react-custom-scrollbars';
import { Button, Avatar } from 'antd';

import Textarea from '../../../../Textarea';
import Message from './Message';

const ChatRoom = props => {
  const {
    uid = '',
    shouldScroll = false,
    messagesLength,
    messages: msgProps = [],
    tokenRoom = '',
    onClearScroll = null,
    onKeyDown = null,
    pushMessage = null,
    myAvatar = null,
  } = props;

  const refScrollbar = useRef(null);
  const [isMount, setMount] = useState(false);
  const [token] = useState(tokenRoom);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState(msgProps);

  const redirectUserProfile = (event, link) => {
    console.log(link);
  };

  const scrollHandler = useCallback(
    event => {
      if (refScrollbar && refScrollbar.current) {
        const scrollTop = refScrollbar.current.getScrollTop();
        const scrollHeight = refScrollbar.current.getScrollHeight();

        if (scrollHeight - scrollTop < 350 && isMount) {
          return;
        }

        if (!event) {
          refScrollbar.current.scrollToBottom();
          return;
        }

        if (scrollHeight - scrollTop < 350 && onClearScroll) {
          refScrollbar.current.scrollToBottom();
          onClearScroll();
        }
      }
    },
    [isMount, refScrollbar, onClearScroll],
  );

  useEffect(() => {
    if (messages.length !== msgProps.length) setMessages([...msgProps]);

    scrollHandler();
  }, [messages, msgProps, scrollHandler]);

  useEffect(() => {
    if (isMount) return;
    scrollHandler();
    setMount(true);
  }, [isMount, scrollHandler]);

  useEffect(() => {
    if (shouldScroll) scrollHandler(true);
  }, [messagesLength, shouldScroll, scrollHandler]);

  const onChange = event => {
    const { currentTarget: { value = '' } = {} } = event;
    if (value !== msg) setMsg(value);
  };

  const _onSubmit = (event, msgValue = null) => {
    if (_.isNull(msgValue)) {
      if ((event.which || event.keyCode) && (event.which || event.keyCode) !== 13) return;
      if ((event.which || event.keyCode) && (event.which || event.keyCode) === 13) {
        event.preventDefault();
      }
      onKeyDown(event, msgValue ? msgValue : msg);
      scrollHandler();
      setMsg('');
    } else if (event && !_.isNull(msgValue)) {
      pushMessage(event, msgValue);
      scrollHandler();
      setMsg('');
    }
  };

  const renderChat = messages => {
    return messages.map((it, i) => {
      const isMine = uid === it.authorId && uid.includes(it.authorId);

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
            <React.Fragment>
              <div className="msg_header">
                {it.displayName !== 'System' ? (
                  <span
                    onClick={event => redirectUserProfile(event, it.authorId ? it.authorId : null)}
                    className="msg_author"
                  >
                    <Avatar src={`data:image/png;base64,${isMine ? myAvatar : null}`} size="small" />
                    {it.displayName}
                  </span>
                ) : (
                  <p className="admin_wrapper">{it.displayName}</p>
                )}

                {it.displayName !== 'System' ? (
                  <span className="msg_date">{it.date ? it.date : 'No date'}.</span>
                ) : null}
              </div>
              <p className="wrapper_msg">{it.msg}</p>
            </React.Fragment>
          </Message>
        </div>
      );
    });
  };

  return (
    <div key={token} className="chatRoom">
      <div className="chatWindow">
        <div id="containerChat">
          <Scrollbars ref={refScrollbar}>
            <div className="flex-group">{renderChat(messages)}</div>
          </Scrollbars>
        </div>
      </div>
      <Textarea value={msg} onChange={onChange} onKeyDown={e => _onSubmit(e)} className="chat-area" />
      <Button onClick={e => _onSubmit(e, msg)} type="primary">
        Отправить
      </Button>
    </div>
  );
};

export default ChatRoom;
