import { createAction } from 'redux-actions';
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
  ADD_TO_ROUTE_DATA,
} from './const';

export const addTabAction = createAction(ADD_TAB);
export const shouldUpdateAction = createAction(SET_UPDATE);
export const setActiveTabAction = createAction(SET_ACTIVE_TAB);
export const openPageWithDataAction = createAction(OPEN_PAGE_WITH_DATA);
export const removeTabAction = createAction(REMOVE_TAB);
export const logoutAction = createAction(LOGOUT);
export const saveComponentStateAction = createAction(SAVE_STATE);
export const addToRouteDataAction = createAction(ADD_TO_ROUTE_DATA);
export const updateItemStateAction = createAction(UPDATE_ITEM);
export const loadFlagAction = createAction(SET_FLAG_LOAD_DATA);
