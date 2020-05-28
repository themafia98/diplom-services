import PropTypes from 'prop-types';
import { udataType, contentState, emptyShape, newsItemType } from 'types';
const { func, string, bool, object, oneOf, arrayOf, objectOf, oneOfType, number, array } = PropTypes;

export const contactModuleType = {
  onErrorRequestAction: func.isRequired,
  path: string.isRequired,
  visible: bool.isRequired,
  actionTabs: arrayOf(string.isRequired).isRequired,
  statusApp: string.isRequired,
  router: object.isRequired,
  rest: object.isRequired,
  onSetStatus: func.isRequired,
  loaderMethods: objectOf(func.isRequired).isRequired,
  udata: udataType.isRequired,
  onLoadCurrentData: func.isRequired,
};

export const newsType = {
  data: object.isRequired,
  isLoading: bool.isRequired,
  isBackground: bool.isRequired,
  visible: bool.isRequired,
  router: object.isRequired,
  statusApp: string.isRequired,
  onOpenPageWithData: func.isRequired,
  setCurrentTab: func.isRequired,
  onCaching: func.isRequired,
};

export const newsViewType = {
  isBackground: bool.isRequired,
  visible: bool.isRequired,
  content: oneOfType([emptyShape.isRequired, contentState.isRequired]).isRequired,
  title: string.isRequired,
  id: string.isRequired,
};

export const newsCardType = {
  onClick: oneOfType([oneOf([null]), func]).isRequired,
  className: string.isRequired,
  data: oneOfType([newsItemType.isRequired, emptyShape.isRequired]).isRequired,
};

export const createNewsType = {
  readOnly: bool.isRequired,
  udata: udataType.isRequired,
  statusApp: string.isRequired,
  isBackground: bool.isRequired,
  visible: bool.isRequired,
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
  type: string.isRequired,
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
  type: string.isRequired,
  chat: object.isRequired,
  udata: udataType,
  socketConnection: bool.isRequired,
  socketErrorStatus: oneOfType([string, () => null]),
  webSocket: oneOfType([object, () => null]),
  onUpdateRoom: func,
  onLoadingDataByToken: func,
  tokenRoom: oneOfType([string, () => null]),
  onLoadActiveChats: func,
  onSetSocketConnection: func,
};
