// @ts-nocheck
/** Here action constants import */
import { SET_ERROR, SET_CACHE, SET_STATUS, SHOW_GUIDE, UDATA_LOAD, CLEAR_CACHE, UPDATE_UDATA } from './const';

export const errorRequestAction = (state) => {
  return {
    type: SET_ERROR,
    payload: state,
  };
};

export const updateUdata = (state) => {
  return {
    type: UPDATE_UDATA,
    payload: state,
  };
};

export const showGuile = (state) => {
  return {
    type: SHOW_GUIDE,
    payload: state,
  };
};

export const loadUdata = (state) => {
  return {
    type: UDATA_LOAD,
    payload: state,
  };
};

export const сachingAction = (state) => {
  return {
    type: SET_CACHE,
    payload: state,
  };
};

export const clearCache = (state) => {
  return {
    type: CLEAR_CACHE,
    payload: state,
  };
};

export const setStatus = (state) => {
  return {
    type: SET_STATUS,
    payload: state,
  };
};
