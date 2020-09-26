import { combineReducers } from 'redux';
import publicReducer from './publicReducer';
import router from './routerStateReducer';
import socketReducer from './socketReducer';
import systemReducer from './systemReducer';

export default combineReducers({
  publicReducer,
  router,
  socketReducer,
  systemReducer,
});
