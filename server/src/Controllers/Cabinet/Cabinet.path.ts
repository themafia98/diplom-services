import { ROUTE_PARAMS } from '../../Models/Router/Router.constant';

export const CABINET_ROUTE: Record<string, Record<string, string>> = {
  v1: {
    LOAD_USER: `/:${ROUTE_PARAMS.USER_ID}/loadAvatar`,
    FIND_USER: '/findUser',
  },
};
