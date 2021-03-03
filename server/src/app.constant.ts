import { ActionsAccess } from './Utils/Interfaces/Interfaces.global';

export const ACTIONS_ACCESS: Readonly<ActionsAccess> = {
  EDIT: 'EDIT',
  VIEW: 'VIEW',
  LIMITED_VIEW: 'LIMITED_VIEW',
  READ_VIEW: 'READ_VIEW',
  CREATE: 'CREATE',
  DELETE: 'DELETE',
};

export const FULL_ACTIONS_ACCESS = Object.values(ACTIONS_ACCESS).filter(
  (it) => it !== ACTIONS_ACCESS.LIMITED_VIEW && it !== ACTIONS_ACCESS.READ_VIEW,
);
