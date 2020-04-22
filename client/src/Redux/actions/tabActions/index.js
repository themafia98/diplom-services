// @ts-nocheck
import { SET_LOGOUT_TABS } from './const';

export const setLogoutTabs = (state) => {
  return {
    type: SET_LOGOUT_TABS,
    payload: state,
  };
};
