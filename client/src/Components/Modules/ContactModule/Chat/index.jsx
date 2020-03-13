import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import moment from 'moment';
import _ from 'lodash';
import io from 'socket.io-client';

import ChatMenu from './ChatMenu';

import { notification, message, Popover } from 'antd';

import { setSocketConnection, addMsg } from '../../../../Redux/actions/socketActions';
import { loadActiveChats, loadingDataByToken, updateRooms } from '../../../../Redux/actions/socketActions/middleware';

import ChatModel from '../../../../Models/Chat';

import Loader from '../../../Loader';
import ChatModal from './ChatRoom/ChatModal';
import TitleModule from '../../../TitleModule';
import ChatRoom from './ChatRoom';

import modelsContext from '../../../../Models/context';

class Chat extends React.PureComponent {
  state = {
    visible: null,
  };

  static contextType = modelsContext;

  socket = null;
  updaterChats = null;

  componentDidMount = () => {
    const { onUpdateRoom } = this.props;
    //  const isDev = process.env.NODE_ENV === "development";
    this.chat = new ChatModel(io('/'));

    this.chat.useDefaultEvents();

    this.chat.getSocket().on('updateChatsRooms', onUpdateRoom);

    this.chat.getSocket().on('connection', this.connection);
    this.chat.getSocket().on('updateFakeRoom', this.updateFakeRoom);
    this.chat.getSocket().on('msg', this.addMsg);
    this.chat.getSocket().on('error', this.errorConnection);
  };

  componentWillUnmount = () => {
    if (!_.isNull(this.updaterChats)) {
      clearInterval(this.updaterChats);
    }
  };

  componentDidUpdate = prevProps => {
    const {
      socketConnection,
      tokenRoom = '',
      onSetSocketConnection,
      onUpdateRoom = null,
      onLoadActiveChats,
      udata: { _id: uid } = {},
      chat: { chatToken = null, listdata = [], shouldLoadingMessage = false } = {},
      udata: { displayName = '' } = {},
      onLoadingDataByToken = null,
    } = this.props;

    const { shouldUpdate = false } = this.state;

    if (prevProps.socketConnection && !socketConnection) {
      onSetSocketConnection({ socketConnection: false, module: null });
      return;
    }

    if (shouldLoadingMessage) {
      onLoadingDataByToken(chatToken, listdata, 'chat', false);
    }

    if (_.isNull(this.updaterChats) && socketConnection) {
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
        });
      }, 5000);
    }

    if ((prevProps.tokenRoom !== tokenRoom && !_.isNull(prevProps.tokenRoom)) || shouldUpdate) {
      if (onLoadActiveChats) {
        this.loadChat();
      }

      if (shouldUpdate) {
        this.setState({
          shouldUpdate: false,
        });
      }
    }
  };

  errorConnection = () => {
    const { onSetSocketConnection } = this.props;
    onSetSocketConnection({ socketConnection: false, activeModule: 'chat' });
  };

  addMsg = msgObj => {
    console.log('addMsg');
    const { onAddMsg } = this.props;
    if (_.isObject(msgObj)) onAddMsg(msgObj);
  };

  updateFakeRoom = entity => {
    const { onUpdateRoom = null } = this.props;
    const { room = {}, msg = {} } = entity || {};
    console.log('updateFakeRoom client:', room);
    if (!room || _.isEmpty(room)) return;

    onUpdateRoom({ room, msg });
  };

  connection = socketConnection => {
    const { chat: { chatToken: tokenRoom = null } = {}, udata: { _id: uid } = {}, onLoadActiveChats } = this.props;

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
        });
    } else {
      message.error('Соединение не установлено, попытка восстановить соединение.');
    }
  };

  loadChat = () => {
    const { socketConnection, onLoadActiveChats, udata: { _id: uid } = {} } = this.props;

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
    });
  };

  onCreateRoom = event => {
    this.setState({
      ...this.state,
      visible: true,
    });
  };

  onClearScroll = evt => {
    const { shouldScroll = false } = this.state;

    if (shouldScroll)
      this.setState({
        shouldScroll: false,
      });
  };

  pushMessage = (event, msg) => {
    const {
      interlocutorIdFakeRoom = null,
      chat: { chatToken: tokenRoom = '', group = '' } = {},
      udata: { displayName, _id: authorId = '' } = {},
    } = this.props;

    if (_.isNull(tokenRoom)) {
      return notification.error({ message: 'Ошибка чата', description: 'Данные повреждены.' });
    }

    if (!msg) return message.error('Недопустимые значения или вы ничего не ввели.');

    const parseMsg = {
      authorId,
      tokenRoom: tokenRoom.split('__fake')[0],
      displayName,
      date: moment().format('DD.MM.YYYY HH:mm:ss'),
      groupName: group,
      moduleName: 'chat',
      groupName: 'single',
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

    if (id < 0) {
      onLoadingDataByToken(token, listdata, 'chat', membersIds[1]);
      return;
    }

    if (chatToken !== token || !token) {
      if (onLoadingDataByToken) {
        onLoadingDataByToken(token, listdata, 'chat', false);
        this.chat.getSocket().emit('onChatRoomActive', { token, displayName });
      }
    } else if (!token) message.warning('Чат комната не найдена либо требуется обновить систему.');
  };

  onVisibleChange = (visible, shouldUpdate) => {
    this.setState({
      ...this.state,
      shouldUpdate: true,
      visible: !visible,
    });
  };

  renderModal = visible => {
    const {
      chat: { usersList = [], listdata = [] } = {},
      udata: { _id: uid } = {},
      onSetActiveChatToken,
      onLoadActiveChats,
    } = this.props;

    const { Request = null } = this.context;

    return (
      <ChatModal
        onVisibleChange={this.onVisibleChange}
        visible={visible}
        usersList={usersList}
        uid={uid}
        listdata={listdata}
        onLoadActiveChats={onLoadActiveChats}
        onSetActiveChatToken={onSetActiveChatToken}
        Request={Request}
      />
    );
  };

  parseChatJson = ({ type, mode = 'displayName', item = {} }) => {
    const { membersIds = [], groupName = '' } = item || {};

    const { chat: { usersList = [] } = {} } = this.props;

    if ((Array.isArray(membersIds) && !membersIds.length) || !membersIds) {
      return null;
    }

    if (type === 'single') {
      if (membersIds.length < 2) return null;

      const InterlocutorId = membersIds[1];
      let interlocutor = usersList.find(user => user._id === InterlocutorId) || null;

      if (!interlocutor) {
        interlocutor = usersList.find(user => user._id === membersIds[0]) || {};
      }

      const { [mode]: field = '' } = interlocutor || {};
      return field;
    }

    if (type === 'group') return groupName;
  };

  getUsersList = () => {
    const {
      chat: { chatToken: tokenRoom = null, usersList = [], listdata = [] } = {},
      udata: { displayName = '' } = {},
    } = this.props;

    const room = listdata.find(room => {
      return room.tokenRoom && room.tokenRoom === tokenRoom;
    });

    const { membersIds = [] } = room || {};

    const names = usersList
      .map(it => {
        if (membersIds.includes(it._id)) {
          return it.displayName;
        }
        return null;
      })
      .filter(Boolean);

    names.unshift(displayName);

    const list = names.map((name, index) => (
      <li className="simpleLink" key={`${index}${name}`}>
        {name}
      </li>
    ));
    return <ol className="usersList-room">{list}</ol>;
  };

  render() {
    const { visible, shouldScroll = false } = this.state;
    const {
      chat: { listdata, usersList = [], listdataMsgs = [], chatToken: tokenRoom = null } = {},
      udata: { _id: uid = '' } = {},
      socketConnection,
      socketErrorStatus,
    } = this.props;

    const isDev = process.env.NODE_ENV === 'development';

    const usersListComponent = tokenRoom ? this.getUsersList() : null;

    return (
      <div className="chat">
        <TitleModule classNameTitle="ContactModule__chatTitle" title="Корпоративный чат" />
        {this.renderModal(visible)}
        <div className="chat__main">
          <ChatMenu
            uid={uid}
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
                        Участников: <span className="link">{listdata.length}</span>
                      </p>
                    </Popover>
                  ) : null}
                  {isDev && tokenRoom ? <p> | {tokenRoom} </p> : null}
                </div>
                <p className={clsx('chat_content__header__statusChat', !socketConnection ? 'isOffline' : 'isOnline')}>
                  {!socketConnection && !tokenRoom ? 'не активен' : 'активен'}
                </p>
              </div>
              <div className="chat_content__main">
                {!socketConnection && !socketErrorStatus ? (
                  <Loader />
                ) : tokenRoom ? (
                  <ChatRoom
                    key={tokenRoom}
                    uid={uid.trim()}
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
                    {!socketErrorStatus ? (
                      <p className="emptyChatRoomMsg">Выберите собеседника</p>
                    ) : (
                      <p className="socket-error">{socketErrorStatus}</p>
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

const mapStateToProps = state => {
  const {
    chat = {},
    chat: { chatToken: tokenRoom = null, listdataMsgs = {}, isFake: interlocutorIdFakeRoom = null } = {},
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

const mapDispatchToProps = dispatch => {
  return {
    onAddMsg: async payload => dispatch(addMsg(payload)),
    onLoadActiveChats: async payload => dispatch(loadActiveChats(payload)),
    onSetSocketConnection: status => dispatch(setSocketConnection(status)),
    onLoadingDataByToken: (token, listdata, moduleName, isFake) => {
      dispatch(loadingDataByToken(token, listdata, moduleName, isFake));
    },
    onUpdateRoom: payload => dispatch(updateRooms(payload)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Chat);
