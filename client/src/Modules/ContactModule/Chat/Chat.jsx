import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import moment from 'moment';
import _ from 'lodash';
import { chatType } from '../types';
import ChatMenu from './ChatMenu';

import { notification, message, Popover, Spin } from 'antd';

import { setSocketConnection, addMsg } from 'Redux/actions/socketActions';
import { loadActiveChats, loadingDataByToken, updateRooms } from 'Redux/actions/socketActions/middleware';

import ChatModel from 'Models/Chat';
import ChatModal from './ChatRoom/ChatModal';
import TitleModule from 'Components/TitleModule';
import ChatRoom from './ChatRoom';

import modelsContext from 'Models/context';
import { compose } from 'redux';
import { withClientDb } from 'Models/ClientSideDatabase';

class Chat extends PureComponent {
  state = {
    visible: null,
  };

  static propTypes = chatType;
  static contextType = modelsContext;
  static defaultProps = {
    type: 'default',
    chat: {},
    udata: {},
    socketConnection: false,
    socketErrorStatus: null,
    webSocket: null,
  };

  socket = null;
  updaterChats = null;

  componentDidMount = () => {
    const { onUpdateRoom, webSocket = null, isTab = false, onChangeVisibleAction } = this.props;

    if (isTab && onChangeVisibleAction) {
      onChangeVisibleAction(null, false, false);
    }

    if (!webSocket) return;
    if (!webSocket?.connected) webSocket.connect();
    else this.connection(true);

    this.chat = new ChatModel(webSocket);

    this.chat.useDefaultEvents();
    this.chat.getSocket().on('updateChatsRooms', onUpdateRoom);
    this.chat.getSocket().on('connection', this.connection);
    this.chat.getSocket().on('updateFakeRoom', this.updateFakeRoom);
    this.chat.getSocket().on('msg', this.addMsg);
    this.chat.getSocket().on('error', this.errorConnection);
  };

  componentWillUnmount = () => {
    if (this.updaterChats !== null) clearInterval(this.updaterChats);
  };

  componentDidUpdate = (prevProps) => {
    const {
      socketConnection,
      tokenRoom = '',
      onSetSocketConnection,
      onLoadActiveChats,
      udata: { _id: uid } = {},
      chat: { chatToken = null, listdata = [], shouldLoadingMessage = false } = {},
      onLoadingDataByToken = null,
      webSocket = null,
      clientDB,
    } = this.props;
    if (!webSocket) return;
    const { shouldUpdate = false } = this.state;

    if (prevProps?.socketConnection && !socketConnection) {
      onSetSocketConnection({ socketConnection: false, module: null });
      return;
    }

    if (shouldLoadingMessage) {
      onLoadingDataByToken(chatToken, listdata, 'chat', false);
    }

    if (this.updaterChats === null && socketConnection) {
      this.updaterChats = setInterval(() => {
        onLoadActiveChats({
          path: 'loadChats',
          actionPath: 'chatRoom',
          actionType: 'entrypoint_chat',
          options: {
            limitList: null,
            socket: {
              socketConnection,
              module: 'chat',
            },
            uid,
          },
          shouldRefresh: true,
          clientDB,
        });
      }, 5000);
    }

    if ((prevProps.tokenRoom !== tokenRoom && prevProps.tokenRoom !== null) || shouldUpdate) {
      if (onLoadActiveChats) {
        this.loadChat();
      }

      if (shouldUpdate)
        this.setState({
          ...this.state,
          shouldUpdate: false,
        });
    }
  };

  errorConnection = () => {
    const { onSetSocketConnection } = this.props;
    onSetSocketConnection({ socketConnection: false, activeModule: 'chat' });
  };

  addMsg = (msgObj) => {
    const { onAddMsg } = this.props;
    if (msgObj && typeof msgObj === 'object') onAddMsg(msgObj);
  };

  updateFakeRoom = (entity) => {
    const { onUpdateRoom = null } = this.props;
    const { room = {}, msg = {} } = entity || {};

    if (!room || _.isEmpty(room)) return;

    onUpdateRoom({ room, msg });
  };

  connection = (socketConnection) => {
    const {
      chat: { chatToken: tokenRoom = null } = {},
      udata: { _id: uid } = {},
      onLoadActiveChats,
      clientDB,
    } = this.props;

    if (socketConnection) {
      if (onLoadActiveChats)
        onLoadActiveChats({
          path: 'loadChats',
          actionPath: 'chatRoom',
          actionType: 'entrypoint_chat',
          options: {
            limitList: null,
            socket: {
              socketConnection,
              module: 'chat',
            },
            tokenRoom,
            uid,
          },
          clientDB,
        });
    } else {
      message.error('Соединение не установлено, попытка восстановить соединение.');
    }
  };
  loadChat = () => {
    const { socketConnection, onLoadActiveChats, udata: { _id: uid } = {}, clientDB } = this.props;

    onLoadActiveChats({
      path: 'loadChats',
      actionPath: 'chatRoom',
      actionType: 'entrypoint_chat',
      options: {
        limitList: null,
        socket: {
          socketConnection,
          module: 'chat',
        },
        tokenRoom: null,
        uid,
      },
      clientDB,
    });
  };

  onCreateRoom = () => {
    this.setState({
      ...this.state,
      visible: true,
    });
  };

  onClearScroll = (evt) => {
    const { shouldScroll = false } = this.state;

    if (shouldScroll)
      this.setState({
        ...this.state,
        shouldScroll: false,
      });
  };

  pushMessage = (event, msg) => {
    const {
      interlocutorIdFakeRoom = null,
      chat: { chatToken: tokenRoom = '', group = '' } = {},
      udata: { displayName = '', _id: authorId = '' } = {},
    } = this.props;

    if (tokenRoom === null) {
      return notification.error({ message: 'Ошибка чата', description: 'Данные повреждены.' });
    }

    if (!msg) return message.error('Недопустимые значения или вы ничего не ввели.');

    const parseMsg = {
      authorId,
      tokenRoom: tokenRoom.split('__fake')[0],
      displayName,
      date: moment().format('DD.MM.YYYY HH:mm:ss'),
      groupName: group ? group : 'single',
      moduleName: 'chat',
      msg,
    };

    if (tokenRoom.includes('__fakeRoom') && interlocutorIdFakeRoom) {
      const interlocutorId = interlocutorIdFakeRoom;

      this.chat.getSocket().emit('initFakeRoom', { fakeMsg: parseMsg, interlocutorId });
      return;
    }

    this.chat.getSocket().emit('newMessage', parseMsg);
  };

  setActiveChatRoom = (event, id, membersIds = [], token = '') => {
    const {
      chat: { chatToken = null, listdata = [] } = {},
      udata: { displayName = '' } = {},
      onLoadingDataByToken = null,
    } = this.props;

    if (id < 0 && onLoadingDataByToken) {
      /**
       *  id < 0 - fake room
       */
      onLoadingDataByToken(token, listdata, 'chat', membersIds[1]);
      return;
    }

    if (chatToken !== token || !token) {
      onLoadingDataByToken(token, listdata, 'chat', false);
      this.chat.getSocket().emit('onChatRoomActive', { token, displayName });
    } else if (!token) message.warning('Чат комната не найдена либо требуется обновить систему.');
  };

  onVisibleChange = (visible) => {
    this.setState({
      ...this.state,
      shouldUpdate: true,
      visible: !visible,
    });
  };

  renderModal = (visible) => {
    const {
      chat: { usersList = [], listdata = [] } = {},
      udata: { _id: uid } = {},
      onSetActiveChatToken,
      onLoadActiveChats,
    } = this.props;

    return (
      <ChatModal
        onVisibleChange={this.onVisibleChange}
        visible={visible}
        usersList={usersList}
        uid={uid}
        listdata={listdata}
        onLoadActiveChats={onLoadActiveChats}
        onSetActiveChatToken={onSetActiveChatToken}
      />
    );
  };

  parseChatJson = ({ type, mode = '', item = {} }) => {
    const { membersIds = [], groupName = '' } = item || {};

    const { chat: { usersList = [] } = {} } = this.props;

    if ((Array.isArray(membersIds) && !membersIds?.length) || !membersIds) {
      return null;
    }

    if (type === 'group') return { displayName: groupName };

    /** -- parse single room -- */
    if (membersIds.length < 2) return null;

    const InterlocutorId = membersIds[1];
    let interlocutor = usersList.find((user) => user._id === InterlocutorId) || null;

    if (!interlocutor) {
      interlocutor = usersList.find((user) => user._id === membersIds[0]) || {};
    }

    const { [mode]: field = '' } = interlocutor || {};

    if (mode) return { field };
    else return interlocutor;
  };

  getUsersList = () => {
    const {
      chat: { chatToken: tokenRoom = null, usersList = [], listdata = [] } = {},
      udata: { displayName = '' } = {},
    } = this.props;

    const room = listdata.find((room) => {
      return room.tokenRoom && room.tokenRoom === tokenRoom;
    });

    const { membersIds = [] } = room || {};

    const names = usersList.reduce((list, it) => {
      if (membersIds.includes(it._id)) {
        return [...list, it.displayName];
      }
      return list;
    }, []);

    names.unshift(displayName);

    return {
      usersListComponent: (
        <ol className="usersList-room">
          {names.map((name, index) => (
            <li className="simpleLink chat-member" key={`${index}${name}`}>
              {name}
            </li>
          ))}
        </ol>
      ),
      count: names.length,
    };
  };

  render() {
    const { visible, shouldScroll = false } = this.state;
    const {
      chat: { listdata = [], usersList = [], listdataMsgs = [], chatToken: tokenRoom = null } = {},
      udata: { _id: uid = '', avatar: myAvatar = null } = {},
      socketConnection,
      socketErrorStatus,
      type,
      webSocket,
    } = this.props;
    const isWs = webSocket !== null;

    const { usersListComponent = null, count = 0 } = tokenRoom ? this.getUsersList() : {};

    return (
      <div className="chat">
        {type !== 'modal' ? (
          <TitleModule classNameTitle="ContactModule__chatTitle" title="Корпоративный чат" />
        ) : null}
        {isWs ? this.renderModal(visible) : null}
        <div className="chat__main">
          <ChatMenu
            uid={uid}
            type={type}
            isWs={isWs}
            socketConnection={socketConnection}
            socketErrorStatus={socketErrorStatus}
            listdata={listdata}
            usersList={usersList}
            tokenRoom={tokenRoom}
            setActiveChatRoom={this.setActiveChatRoom}
            parseChatJson={this.parseChatJson}
            onCreateRoom={this.onCreateRoom}
          />
          <div className="col-chat-content">
            <div className="chat_content">
              <div className="chat_content__header">
                <div className="area-left">
                  <p className="chat_content__header__title">Окно чата.</p>
                  {tokenRoom && !tokenRoom.includes('fakeRoom') ? (
                    <Popover content={usersListComponent}>
                      <p className="counter-room">
                        Участников: <span className="link">{count}</span>
                      </p>
                    </Popover>
                  ) : null}
                </div>
                <p
                  className={clsx(
                    'chat_content__header__statusChat',
                    !socketConnection ? 'isOffline' : 'isOnline',
                  )}
                >
                  {!socketConnection && !tokenRoom ? 'не активен' : 'активен'}
                </p>
              </div>
              <div className="chat_content__main">
                {!socketConnection && !socketErrorStatus && isWs ? (
                  <Spin size="large" />
                ) : tokenRoom && isWs ? (
                  <ChatRoom
                    key={tokenRoom}
                    uid={uid.trim()}
                    myAvatar={myAvatar}
                    usersList={usersList}
                    onClearScroll={this.onClearScroll}
                    shouldScroll={shouldScroll}
                    onKeyDown={this.pushMessage}
                    tokenRoom={tokenRoom}
                    listdata={listdata}
                    pushMessage={this.pushMessage}
                    messages={listdataMsgs[tokenRoom] || []}
                  />
                ) : (
                  <div className="emptyChatRoom">
                    {!socketErrorStatus && isWs ? (
                      <p className="emptyChatRoomMsg">Выберите собеседника</p>
                    ) : isWs ? (
                      <p className="socket-error">{socketErrorStatus}</p>
                    ) : (
                      <p className="webSocket-disable">WebSocket connection is not available</p>
                    )}
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

const mapStateToProps = (state) => {
  const {
    chat = {},
    chat: { chatToken: tokenRoom = null, isFake: interlocutorIdFakeRoom = null } = {},
    socketConnection = false,
    activeSocketModule = null,
    socketErrorStatus = null,
  } = state.socketReducer;

  const { udata = {} } = state.publicReducer;

  return {
    chat,
    socketConnection,
    activeSocketModule,
    socketErrorStatus,
    tokenRoom,
    udata,
    interlocutorIdFakeRoom,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onAddMsg: async (payload) => dispatch(addMsg(payload)),
    onLoadActiveChats: async (payload) => dispatch(loadActiveChats(payload)),
    onSetSocketConnection: (status) => dispatch(setSocketConnection(status)),
    onLoadingDataByToken: (token, listdata, moduleName, isFake) => {
      dispatch(loadingDataByToken(token, listdata, moduleName, isFake));
    },
    onUpdateRoom: (payload) => dispatch(updateRooms(payload)),
  };
};

export default compose(withClientDb, connect(mapStateToProps, mapDispatchToProps))(Chat);
