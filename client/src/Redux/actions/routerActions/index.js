// @ts-nocheck
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

import { setLogoutTabs } from '../tabActions';

export const addTabAction = (state) => {
  return {
    type: ADD_TAB,
    payload: state,
  };
};

export const shouldUpdateAction = (state) => {
  return {
    type: SET_UPDATE,
    payload: state,
  };
};

export const setActiveTabAction = (state) => {
  return {
    type: SET_ACTIVE_TAB,
    payload: state,
  };
};

export const openPageWithDataAction = (state) => {
  return {
    type: OPEN_PAGE_WITH_DATA,
    payload: state,
  };
};

export const removeTabAction = (state) => {
  return {
    type: REMOVE_TAB,
    payload: state,
  };
};

export const logoutRouterAction = (state) => {
  return {
    type: LOGOUT,
    payload: state,
  };
};

export const saveComponentStateAction = (state) => {
  return {
    type: SAVE_STATE,
    payload: state,
  };
};

export const addToRouteDataAction = (state) => {
  return {
    type: ADD_TO_ROUTE_DATA,
    payload: state,
  };
};

export const updateItemStateAction = (state) => {
  return {
    type: UPDATE_ITEM,
    payload: state,
  };
};

export const loadFlagAction = (state) => {
  return {
    type: SET_FLAG_LOAD_DATA,
    payload: state,
  };
};

export const logoutAction = () => (dispatch) => {
  dispatch(setLogoutTabs());
  dispatch(logoutRouterAction());
};
