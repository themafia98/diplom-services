import Cabinet from '../../controllers/Cabinet/Cabinet.controller';
import ChatController from '../../controllers/Contact/Chat/Chat.controller';
import News from '../../controllers/Contact/News/News.controller';
import General from '../../controllers/General/General.controller';
import System from '../../controllers/Main/Main.controller';
import Settings from '../../controllers/Settings/Settings.controller';
import Statistic from '../../controllers/Statistic/Statistic.controller';
import Tasks from '../../controllers/Tasks/Tasks.controller';
import Wiki from '../../controllers/Wiki/Wiki.controller';

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
