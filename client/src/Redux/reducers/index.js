import { combineReducers } from 'redux';
import publicReducer from './publicReducer/publicReducer.slice';
import router from './routerStateReducer';
import socketReducer from './socketReducer/socketReducer.slice';
import systemReducer from './systemReducer/systemReducer.slice';

export default combineReducers({
  publicReducer,
  router,
  socketReducer,
  systemReducer,
});
