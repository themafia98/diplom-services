import CabinetController from '../../Controllers/Cabinet/Cabinet.controller';
import ChatController from '../../Controllers/Contact/Chat/Chat.controller';
import NewsController from '../../Controllers/Contact/News/News.controller';
import GeneralController from '../../Controllers/General/General.controller';
import SystemController from '../../Controllers/System/System.controller';
import SettingsController from '../../Controllers/Settings/Settings.controller';
import StatisticController from '../../Controllers/Statistic/Statistic.controller';
import TasksController from '../../Controllers/Tasks/Tasks.controller';
import WikiController from '../../Controllers/Wiki/Wiki.controller';

export const CONTROLLERS_MAP = {
  MAIN: 'MAIN_CONTROLLER',
  TASKS: 'TASKS_CONTROLLER',
  SYSTEM: 'SYSTEM_CONTROLLER',
  NEWS: 'NEWS_CONTROLLER',
  CHAT: 'CHAT_CONTROLLER',
  SETTINGS: 'SETTINGS_CONTROLLER',
  WIKI: 'WIKI_CONTROLLER',
  CABINET: 'CABINET_CONTROLLER',
  STATISTICS: 'STATISTICS_CONTROLLER',
};

export const CONTROLLERS_REGISTER = {
  [CONTROLLERS_MAP.MAIN]: GeneralController,
  [CONTROLLERS_MAP.TASKS]: TasksController,
  [CONTROLLERS_MAP.SYSTEM]: SystemController,
  [CONTROLLERS_MAP.NEWS]: NewsController,
  [CONTROLLERS_MAP.CHAT]: ChatController,
  [CONTROLLERS_MAP.SETTINGS]: SettingsController,
  [CONTROLLERS_MAP.WIKI]: WikiController,
  [CONTROLLERS_MAP.CABINET]: CabinetController,
  [CONTROLLERS_MAP.STATISTICS]: StatisticController,
};
