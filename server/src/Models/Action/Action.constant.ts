import ActionChatMessage from '../ActionsEntity/ActionChatMessage/ActionChatMessage';
import ActionChatRoom from '../ActionsEntity/ActionChatRoom/ActionChatRoom';
import ActionGlobal from '../ActionsEntity/ActionGlobal/ActionGlobal';
import ActionJournal from '../ActionsEntity/ActionJurnal/ActionJurnal';
import ActionLogger from '../ActionsEntity/ActionLogger/ActionLogger';
import ActionNews from '../ActionsEntity/ActionNews/ActionNews';
import ActionNotification from '../ActionsEntity/ActionNotification/ActionNotification';
import ActionSettings from '../ActionsEntity/ActionSettings/ActionSettings';
import ActionTasks from '../ActionsEntity/ActionTasks/ActionTasks';
import ActionUsers from '../ActionsEntity/ActionUsers/ActionUsers';
import ActionWiki from '../ActionsEntity/ActionWiki/ActionWiki';

export const ACTIONS_ENTITYS_MAP = {
  GLOBAL: 'global',
  NOTIFICATION: 'notification',
  CHAT_ROOM: 'chatRoom',
  CHAT_MSG: 'chatMsg',
  USERS: 'users',
  JURNAL_WORKS: 'jurnalworks',
  TASKS: 'tasks',
  SETTINGS_LOG: 'settingsLog',
  WIKI: 'wiki',
  SETTINGS: 'settings',
  NEWS: 'news',
};

export const ACTIONS_ENTITYS_REGISTER = {
  [ACTIONS_ENTITYS_MAP.GLOBAL]: ActionGlobal,
  [ACTIONS_ENTITYS_MAP.NOTIFICATION]: ActionNotification,
  [ACTIONS_ENTITYS_MAP.CHAT_ROOM]: ActionChatRoom,
  [ACTIONS_ENTITYS_MAP.JURNAL_WORKS]: ActionJournal,
  [ACTIONS_ENTITYS_MAP.SETTINGS]: ActionSettings,
  [ACTIONS_ENTITYS_MAP.SETTINGS_LOG]: ActionLogger,
  [ACTIONS_ENTITYS_MAP.WIKI]: ActionWiki,
  [ACTIONS_ENTITYS_MAP.TASKS]: ActionTasks,
  [ACTIONS_ENTITYS_MAP.CHAT_MSG]: ActionChatMessage,
  [ACTIONS_ENTITYS_MAP.USERS]: ActionUsers,
  [ACTIONS_ENTITYS_MAP.NEWS]: ActionNews,
};
