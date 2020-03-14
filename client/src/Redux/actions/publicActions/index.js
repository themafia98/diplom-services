/** Here action constants import */
import { SET_ERROR, SET_CACHE, SET_STATUS, SHOW_GUIDE, UDATA_LOAD, CLEAR_CACHE, UPDATE_UDATA } from './const';

export /**
 * @param {any} state
 */
const errorRequstAction = state => {
  return {
    type: SET_ERROR,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const updateUdata = state => {
  return {
    type: UPDATE_UDATA,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const showGuile = state => {
  return {
    type: SHOW_GUIDE,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const loadUdata = state => {
  return {
    type: UDATA_LOAD,
    payload: state,
  };
};

export /**
 * @param {{ data: any; load: boolean; primaryKey: any; }} state
 */
const сachingAction = state => {
  return {
    type: SET_CACHE,
    payload: state,
  };
};

export /**
 * @param {any} state
 */
const clearCache = state => {
  return {
    type: CLEAR_CACHE,
    payload: state,
  };
};

export /**
 * @param {{ statusRequst: any; }} state
 */
const setStatus = state => {
  return {
    type: SET_STATUS,
    payload: state,
  };
};
