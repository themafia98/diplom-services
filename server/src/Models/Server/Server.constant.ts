import Cabinet from '../../Controllers/Cabinet';
import ChatController from '../../Controllers/Contact/Chat';
import News from '../../Controllers/Contact/News';
import General from '../../Controllers/General';
import System from '../../Controllers/Main';
import Settings from '../../Controllers/Settings';
import Statistic from '../../Controllers/Statistic';
import Tasks from '../../Controllers/Tasks';
import Wiki from '../../Controllers/Wiki';

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
