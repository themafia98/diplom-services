import { combineReducers } from 'redux';
import publicReducer from './publicReducer.slice';
import router from './routerReducer.slice';
import socketReducer from './socketReducer.slice';
import systemReducer from './systemReducer.slice';

export default combineReducers({
  publicReducer,
  router,
  socketReducer,
  systemReducer,
});
