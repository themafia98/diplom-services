import Cabinet from '../../Controllers/Cabinet/Cabinet.controller';
import ChatController from '../../Controllers/Contact/Chat/Chat.controller';
import News from '../../Controllers/Contact/News/News.controller';
import General from '../../Controllers/General/General.controller';
import System from '../../Controllers/Main/Main.controller';
import Settings from '../../Controllers/Settings/Settings.controller';
import Statistic from '../../Controllers/Statistic/Statistic.controller';
import Tasks from '../../Controllers/Tasks/Tasks.controller';
import Wiki from '../../Controllers/Wiki/Wiki.controller';

export const CONTROLLERS = {
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

export const CONTROLLERS_MAP = {
  [CONTROLLERS.MAIN]: General.Main,
  [CONTROLLERS.TASKS]: Tasks.TasksController,
  [CONTROLLERS.SYSTEM]: System.SystemData,
  [CONTROLLERS.NEWS]: News.NewsController,
  [CONTROLLERS.CHAT]: ChatController,
  [CONTROLLERS.SETTINGS]: Settings.SettingsController,
  [CONTROLLERS.WIKI]: Wiki.WikiController,
  [CONTROLLERS.CABINET]: Cabinet.CabinetController,
  [CONTROLLERS.STATISTICS]: Statistic.StatisticController,
};
