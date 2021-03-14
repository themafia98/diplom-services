import { ROUTE_PARAMS } from '../../Models/Router/Router.constant';

export const MAIN_ROUTE: Record<string, Record<string, string>> = {
  v1: {
    CORE_APP_CONFIG: `/core/:${ROUTE_PARAMS.TYPE}/config`,
    USERS_LIST: '/userList',
    SAVE_FILE: `/:${ROUTE_PARAMS.MODULE}/file`,
    LOAD_FILE: `/:${ROUTE_PARAMS.MODULE}/load/file`,
    DOWNLOAD_FILE: `/:${ROUTE_PARAMS.MODULE}/download/:${ROUTE_PARAMS.ENTITY_ID}/:${ROUTE_PARAMS.FILENAME}`,
    DELETE_FILE: `/:${ROUTE_PARAMS.MODULE}/delete/file`,
    UPDATE_SINGLE: `/:${ROUTE_PARAMS.MODULE}/update/single`,
    UPDATE_MANY: `/:${ROUTE_PARAMS.MODULE}/update/many`,
    LOAD_NOTIFICATION: `/:${ROUTE_PARAMS.TYPE}/notification`,
    CHECK_AVAILABLE_PAGE: '/security/page',
    SYNC: '/sync',
  },
};
