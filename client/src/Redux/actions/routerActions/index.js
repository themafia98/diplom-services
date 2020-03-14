import {
  ADD_TAB,
  SET_ACTIVE_TAB,
  REMOVE_TAB,
  LOGOUT,
  OPEN_PAGE_WITH_DATA,
  SAVE_STATE,
  SET_FLAG_LOAD_DATA,
  SET_UPDATE,
  UPDATE_ITEM,
} from './const';

import { setLogoutTabs } from '../tabActions';

export /**
 * @param {any} state
 */
const addTabAction = state => {
  return {
    type: ADD_TAB,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const shouldUpdateAction = state => {
  return {
    type: SET_UPDATE,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const setActiveTabAction = state => {
  return {
    type: SET_ACTIVE_TAB,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const openPageWithDataAction = state => {
  return {
    type: OPEN_PAGE_WITH_DATA,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const removeTabAction = state => {
  return {
    type: REMOVE_TAB,
    payload: state,
  };
};

export /**
 * @param {undefined} [state]
 */
const logoutRouterAction = state => {
  return {
    type: LOGOUT,
    payload: state,
  };
};

export /**
 * @param {{ [x: string]: any; load: boolean; path: string; news?: any[]; mode?: string; }} state
 */
const saveComponentStateAction = state => {
  return {
    type: SAVE_STATE,
    payload: state,
  };
};

export /**
 * @param {{ updaterItem: any; type: any; id: any; }} state
 */
const updateItemStateAction = state => {
  return {
    type: UPDATE_ITEM,
    payload: state,
  };
};

export /**
 * @param {{ path: string; load: boolean; }} state
 */
const loadFlagAction = state => {
  return {
    type: SET_FLAG_LOAD_DATA,
    payload: state,
  };
};

// middlewares

export const logoutAction = () =>
  /**
   * @param {(arg0: { type: string; payload: any; }) => void} dispatch
   */
  {
    return dispatch => {
      dispatch(setLogoutTabs());
      dispatch(logoutRouterAction());
    };
  };
