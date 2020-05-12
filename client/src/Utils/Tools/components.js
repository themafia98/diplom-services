import TaskModule from '../../Modules/TaskModule';
import MainModule from '../../Modules/MainModule';
import CabinetModule from '../../Modules/CabinetModule';
import ContactModule from '../../Modules/ContactModule';
import CustomersModule from '../../Modules/CustomersModule';
import SettingsModule from '../../Modules/SettingsModule';
import WikiModule from '../../Modules/WikiModule';
import StatisticsModule from '../../Modules/StatisticsModule';

import Chat from '../../Modules/ContactModule/Chat';
import News from '../../Modules/ContactModule/News';
import CreateNews from '../../Modules/ContactModule/News/CreateNews';
import NewsViewPage from '../../Modules/ContactModule/News/NewsViewPage';
import CreateTask from '../../Modules/TaskModule/CreateTask';
import TaskModuleCalendar from '../../Modules/TaskModule/TaskModuleCalendar';
import TaskModuleList from '../../Modules/TaskModule/TaskModuleList';
import TaskModuleMyList from '../../Modules/TaskModule/TaskModuleMyList';
import TaskView from '../../Modules/TaskModule/TaskView';

const components = {
  taskModule: TaskModule,
  mainModule: MainModule,
  cabinetModule: CabinetModule,
  contactModule: ContactModule,
  customersModule: CustomersModule,
  settingsModule: SettingsModule,
  wikiModule: WikiModule,
  statisticModule: StatisticsModule,
  chatModule: Chat,
  newsModule: News,
  newViewPageModule: NewsViewPage,
  createTaskModule: CreateTask,
  calendarTaskModule: TaskModuleCalendar,
  taskViewModule: TaskView,
  taskModule_all: TaskModuleList,
  taskModule_myTasks: TaskModuleMyList,
  contactModule__CreateNews: CreateNews,
};

function getComponentByKey(key) {
  try {
    if (!key || typeof key !== 'string') throw new TypeError('key should be string');
    return components[key];
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default { getComponentByKey };
