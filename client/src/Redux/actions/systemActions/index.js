import { createAction } from 'redux-actions';
import { SET_SYSTEM_MESSAGE, SHOW_SYSTEM_LOADER } from './systemActions.const';

export const setSystemMessageAction = createAction(SET_SYSTEM_MESSAGE);
export const showSystemLoaderAction = createAction(SHOW_SYSTEM_LOADER);
