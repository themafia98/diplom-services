import { SET_PATH, ADD_TAB, SET_ACTIVE_TAB } from '../../actions/routerActions/const';

const initialState = {
    position: '/',
    currentActionTab: 'mainModule',
    actionTabs: [],
};

export default (state = initialState, action) => {
    switch (action.type){
        case SET_PATH: return {
            ...state,
            position: action.payload,
        };
        case ADD_TAB: return {
            ...state,
            actionTabs: [...state.actionTabs, {...action.payload}],
            currentActionTab: action.payload.EUID
        }
        case SET_ACTIVE_TAB: return {
            ...state,
            currentActionTab: action.payload,
        };
        default: return state;
    }
};