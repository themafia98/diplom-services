import { combineReducers } from 'redux';
import publicReducer from './publicReducer';

export default combineReducers({
    public: publicReducer,
});