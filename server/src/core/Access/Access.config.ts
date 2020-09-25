import { AccessConfig } from '../../Utils/Interfaces';
import { ROLES } from '../../Models/AccessRole/AcessRole.constant';
import { ACTIONS_ACCESS, FULL_ACTIONS_ACCESS } from '../../app.constant';

export const ACCESS_MODULE_SUPERADMIN: Array<AccessConfig> = [
  { name: 'mainModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'cabinetModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'taskModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'taskModule_myTasks', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'taskModule_сalendar', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'taskModule_createTask', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'customersModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'customersModule_contacts', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'contactModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'contactModule_feedback', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'contactModule_createNews', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'contactModule_chat', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'statisticModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'wikiModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'settingsModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'system', access: true, actions: FULL_ACTIONS_ACCESS },
];

export const ACCESS_MODULE_ADMIN: Array<AccessConfig> = [
  { name: 'mainModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'cabinetModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'taskModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'taskModule_myTasks', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'taskModule_сalendar', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'taskModule_createTask', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'customersModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'customersModule_contacts', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'contactModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'contactModule_feedback', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'contactModule_createNews', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'contactModule_chat', access: true, actions: [] },
  { name: 'statisticModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'wikiModule', access: true, actions: FULL_ACTIONS_ACCESS },
  { name: 'settingsModule', access: true, actions: FULL_ACTIONS_ACCESS },
];

export const ACCESS_MODULE_MEMBER: Array<AccessConfig> = [
  { name: 'mainModule', access: true, actions: [] },
  { name: 'cabinetModule', access: true, actions: [] },
  { name: 'taskModule', access: true, actions: [ACTIONS_ACCESS.VIEW] },
  { name: 'taskModule_myTasks', access: true, actions: [ACTIONS_ACCESS.VIEW, ACTIONS_ACCESS.EDIT] },
  { name: 'taskModule_сalendar', access: true, actions: [ACTIONS_ACCESS.VIEW] },
  { name: 'taskModule_createTask', access: false, actions: [] },
  { name: 'customersModule', access: true, actions: [ACTIONS_ACCESS.VIEW] },
  { name: 'customersModule_contacts', access: false, actions: [ACTIONS_ACCESS.VIEW] },
  { name: 'contactModule', access: true, actions: [ACTIONS_ACCESS.VIEW] },
  { name: 'contactModule_feedback', access: true, actions: [ACTIONS_ACCESS.VIEW] },
  { name: 'contactModule_createNews', access: true, actions: [] },
  { name: 'contactModule_chat', access: true, actions: [] },
  { name: 'statisticModule', access: false, actions: [ACTIONS_ACCESS.VIEW] },
  { name: 'wikiModule', access: true, actions: [ACTIONS_ACCESS.VIEW, ACTIONS_ACCESS.EDIT] },
  { name: 'settingsModule', access: false, actions: [ACTIONS_ACCESS.EDIT] },
];

export const ACCESS_MODULE_GUEST: Array<AccessConfig> = [
  { name: 'mainModule', access: true, actions: [ACTIONS_ACCESS.VIEW] },
  { name: 'cabinetModule', access: true, actions: [ACTIONS_ACCESS.VIEW] },
  { name: 'taskModule', access: false, actions: [] },
  { name: 'taskModule_myTasks', access: false, actions: [] },
  { name: 'taskModule_сalendar', access: false, actions: [] },
  { name: 'taskModule_createTask', access: false, actions: [] },
  { name: 'customersModule', access: false, actions: [] },
  { name: 'customersModule_contacts', access: false, actions: [] },
  { name: 'contactModule', access: false, actions: [] },
  { name: 'contactModule_feedback', access: false, actions: [] },
  { name: 'contactModule_createNews', access: false, actions: [] },
  { name: 'contactModule_chat', access: false, actions: [] },
  { name: 'statisticModule', access: false, actions: [] },
  { name: 'wikiModule', access: false, actions: [] },
  { name: 'settingsModule', access: false, actions: [] },
];

export default function getAccessConfig(role: string = ROLES.GUEST): Array<AccessConfig> {
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
