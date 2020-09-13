import { ROLES } from '../../Models/AccessRole/AcessRole.constant';

export const ACCESS_MODULE_SUPERADMIN = [
  { name: 'mainModule', access: true },
  { name: 'cabinetModule', access: true },
  { name: 'taskModule', access: true },
  { name: 'taskModule_myTasks', access: true },
  { name: 'taskModule_сalendar', access: true },
  { name: 'taskModule_createTask', access: true },
  { name: 'customersModule', access: true },
  { name: 'customersModule_contacts', access: true },
  { name: 'contactModule', access: true },
  { name: 'contactModule_feedback', access: true },
  { name: 'contactModule_createNews', access: true },
  { name: 'contactModule_chat', access: true },
  { name: 'statisticModule', access: true },
  { name: 'wikiModule', access: true },
  { name: 'settingsModule', access: true },
];

export const ACCESS_MODULE_ADMIN = [
  { name: 'mainModule', access: true },
  { name: 'cabinetModule', access: true },
  { name: 'taskModule', access: true },
  { name: 'taskModule_myTasks', access: true },
  { name: 'taskModule_сalendar', access: true },
  { name: 'taskModule_createTask', access: true },
  { name: 'customersModule', access: true },
  { name: 'customersModule_contacts', access: true },
  { name: 'contactModule', access: true },
  { name: 'contactModule_feedback', access: true },
  { name: 'contactModule_createNews', access: true },
  { name: 'contactModule_chat', access: true },
  { name: 'statisticModule', access: true },
  { name: 'wikiModule', access: true },
  { name: 'settingsModule', access: true },
];

export const ACCESS_MODULE_MEMBER = [
  { name: 'mainModule', access: true },
  { name: 'cabinetModule', access: true },
  { name: 'taskModule', access: true },
  { name: 'taskModule_myTasks', access: true },
  { name: 'taskModule_сalendar', access: true },
  { name: 'taskModule_createTask', access: false },
  { name: 'customersModule', access: true },
  { name: 'customersModule_contacts', access: false },
  { name: 'contactModule', access: true },
  { name: 'contactModule_feedback', access: true },
  { name: 'contactModule_createNews', access: true },
  { name: 'contactModule_chat', access: true },
  { name: 'statisticModule', access: false },
  { name: 'wikiModule', access: true },
  { name: 'settingsModule', access: false },
];

export const ACCESS_MODULE_GUEST = [
  { name: 'mainModule', access: true },
  { name: 'cabinetModule', access: true },
  { name: 'taskModule', access: false },
  { name: 'taskModule_myTasks', access: false },
  { name: 'taskModule_сalendar', access: false },
  { name: 'taskModule_createTask', access: false },
  { name: 'customersModule', access: false },
  { name: 'customersModule_contacts', access: false },
  { name: 'contactModule', access: false },
  { name: 'contactModule_feedback', access: false },
  { name: 'contactModule_createNews', access: false },
  { name: 'contactModule_chat', access: false },
  { name: 'statisticModule', access: false },
  { name: 'wikiModule', access: false },
  { name: 'settingsModule', access: false },
];

export default function getAccessConfig(role: string = ROLES.GUEST) {
  switch (role) {
    case ROLES.SUPER_ADMIN:
      return ACCESS_MODULE_SUPERADMIN;
    case ROLES.ADMIN:
      return ACCESS_MODULE_ADMIN;
    case ROLES.MEMBER:
      return ACCESS_MODULE_MEMBER;
    default:
      return ACCESS_MODULE_GUEST;
  }
}
