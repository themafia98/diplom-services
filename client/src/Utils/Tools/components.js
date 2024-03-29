import TaskModule from 'Modules/TaskModule';
import MainModule from 'Modules/MainModule';
import CabinetModule from 'Modules/CabinetModule';
import ContactModule from 'Modules/ContactModule';
import CustomersModule from 'Modules/CustomersModule';
import SettingsModule from 'Modules/SettingsModule';
import WikiModule from 'Modules/WikiModule';
import StatisticsModule from 'Modules/StatisticsModule';
import Contacts from 'Modules/CustomersModule/Contacts/Contacts';

const componentsModules = {
  taskModule: TaskModule,
  mainModule: MainModule,
  cabinetModule: CabinetModule,
  contactModule: ContactModule,
  customersModule: CustomersModule,
  settingsModule: SettingsModule,
  wikiModule: WikiModule,
  statisticModule: StatisticsModule,
  customersModule_contacts: Contacts,
};

export default componentsModules;
