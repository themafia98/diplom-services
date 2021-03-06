import PropTypes from 'prop-types';
import { contentState, emptyShape, newsItemType } from 'App.types';
const { func, string, bool, object, oneOf, arrayOf, oneOfType, number, array, symbol } = PropTypes;

export const contactModuleType = {
  type: symbol.isRequired,
  path: string.isRequired,
  activeTabs: arrayOf(string.isRequired).isRequired,
  statusApp: string.isRequired,
  visibilityPortal: bool,
  clientDB: func,
  webSocket: object,
  onChangeVisibleAction: func,
};

export const newsType = {
  data: object.isRequired,
};

export const newsViewType = {
  isBackground: bool,
  visible: bool,
  content: oneOfType([emptyShape, contentState, oneOf([null])]),
  title: string.isRequired,
  id: string.isRequired,
};

export const newsCardType = {
  onClick: oneOfType([oneOf([null]), func]).isRequired,
  className: string.isRequired,
  data: oneOfType([newsItemType.isRequired, emptyShape.isRequired]).isRequired,
};

export const createNewsType = {
  readOnly: bool,
  statusApp: string.isRequired,
  isBackground: bool,
  visible: bool,
};

export const chatRoomType = {
  uid: string.isRequired,
  shouldScroll: bool.isRequired,
  messages: array.isRequired,
  usersList: array.isRequired,
  tokenRoom: oneOfType([string, () => null]),
  myAvatar: string.isRequired,
  messagesLength: oneOfType([number, string]).isRequired,
  onClearScroll: oneOfType([func, () => null]),
  onKeyDown: oneOfType([func, () => null]),
  pushMessage: oneOfType([func, () => null]),
};

export const chatMenuType = {
  type: oneOfType([string, symbol]),
  isWs: bool.isRequired,
  socketConnection: bool.isRequired,
  socketErrorStatus: oneOfType([string, () => null]),
  listdata: array.isRequired,
  usersList: array.isRequired,
  tokenRoom: oneOfType([string, () => null]),
  parseChatJson: oneOfType([func, () => null]),
  onCreateRoom: oneOfType([func, () => null]),
  uid: string.isRequired,
  setActiveChatRoom: oneOfType([func, () => null]),
};

export const messageType = {
  it: oneOfType([object, () => null]),
  children: oneOfType([object, () => null]),
  showTooltip: bool,
  className: string.isRequired,
};

export const chatType = {
  type: oneOfType([string, symbol]),
  chat: object.isRequired,
  socketConnection: bool.isRequired,
  socketErrorStatus: oneOfType([string, () => null]),
  webSocket: oneOfType([object, () => null]),
  onUpdateRoom: func,
  onLoadingDataByToken: func,
  tokenRoom: oneOfType([string, () => null]),
  onLoadActiveChats: func,
};
