import TaskModuleList from 'Modules/TaskModule/TaskModuleList';
import CreateNews from 'Modules/ContactModule/News/CreateNews';
import Chat from 'Modules/ContactModule/Chat';
import News from 'Modules/ContactModule/News';
import CreateTask from 'Modules/TaskModule/CreateTask';
import TaskModuleCalendar from 'Modules/TaskModule/TaskModuleCalendar';
import TaskView from 'Modules/TaskModule/TaskView';
import NewsViewPage from 'Modules/ContactModule/News/NewsViewPage';
import TaskModuleMyList from 'Modules/TaskModule/TaskModuleMyList/TaskModuleMyList';
import Contacts from 'Modules/CustomersModule/Contacts';

const subModulesComponents = {
  taskModule_all: TaskModuleList,
  taskModule_myTasks: TaskModuleMyList,
  contactModule_createNews: CreateNews,
  contactModule_chat: Chat,
  contactModule_feedback: News,
  newsViewPageModule: NewsViewPage,
  taskModule_createTask: CreateTask,
  taskModule_сalendar: TaskModuleCalendar,
  taskViewModule: TaskView,
  customersModule_contacts: Contacts,
};

export default subModulesComponents;
