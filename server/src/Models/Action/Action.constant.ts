import ActionChatMessage from '../ActionsEntitys/ActionChatMessage/ActionChatMessage';
import ActionChatRoom from '../ActionsEntitys/ActionChatRoom/ActionChatRoom';
import ActionGlobal from '../ActionsEntitys/ActionGlobal/ActionGlobal';
import ActionJournal from '../ActionsEntitys/ActionJurnal/ActionJurnal';
import ActionLogger from '../ActionsEntitys/ActionLogger/ActionLogger';
import ActionNews from '../ActionsEntitys/ActionNews/ActionNews';
import ActionNotification from '../ActionsEntitys/ActionNotification/ActionNotification';
import ActionSettings from '../ActionsEntitys/ActionSettings/ActionSettings';
import ActionTasks from '../ActionsEntitys/ActionTasks/ActionTasks';
import ActionUsers from '../ActionsEntitys/ActionUsers/ActionUsers';
import ActionWiki from '../ActionsEntitys/ActionWiki/ActionWiki';

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
