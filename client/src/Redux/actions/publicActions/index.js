import { createAction } from 'redux-actions';
import {
  SET_ERROR,
  SET_CACHE,
  SET_STATUS,
  SHOW_GUIDE,
  UDATA_LOAD,
  CLEAR_CACHE,
  UPDATE_UDATA,
  LOAD_ARTIFACT,
  LOAD_SETTINGS,
  LOAD_CORE_CONFIG,
} from './const';

export const errorRequestAction = createAction(SET_ERROR);
export const onLoadArtifacts = createAction(LOAD_ARTIFACT);
export const onLoadSettings = createAction(LOAD_SETTINGS);
export const updateUdata = createAction(UPDATE_UDATA);
export const showGuile = createAction(SHOW_GUIDE);
export const loadUdata = createAction(UDATA_LOAD);
export const сachingAction = createAction(SET_CACHE);
export const clearCache = createAction(CLEAR_CACHE);
export const setStatus = createAction(SET_STATUS);
export const loadCoreConfigAction = createAction(LOAD_CORE_CONFIG);
