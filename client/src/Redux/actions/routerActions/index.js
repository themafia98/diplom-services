import {
    SET_PATH,
    ADD_TAB,
    SET_ACTIVE_TAB,
    REMOVE_TAB,
    LOGOUT,
    OPEN_PAGE_WITH_DATA,
    SAVE_STATE,
    SET_FLAG_LOAD_DATA,
} from "./const";
import { setLogoutTabs } from "../tabActions";

export const updatePathAction = state => {
    return {
        type: SET_PATH,
        payload: state,
    };
};

export const addTabAction = state => {
    return {
        type: ADD_TAB,
        payload: state,
    };
};

export const setActiveTabAction = state => {
    return {
        type: SET_ACTIVE_TAB,
        payload: state,
    };
};

export const openPageWithDataAction = state => {
    return {
        type: OPEN_PAGE_WITH_DATA,
        payload: state,
    };
};

export const removeTabAction = state => {
    return {
        type: REMOVE_TAB,
        payload: state,
    };
};

export const logoutRouterAction = state => {
    return {
        type: LOGOUT,
        payload: state,
    };
};

export const saveComponentStateAction = state => {
    return {
        type: SAVE_STATE,
        payload: state,
    };
};

export const logoutAction = state => {
    return dispatch => {
        dispatch(setLogoutTabs());
        dispatch(logoutRouterAction());
    };
};

export const loadFlagAction = state => {
    return {
        type: SET_FLAG_LOAD_DATA,
        payload: state,
    };
};

export const loadCurrentData = path => (dispatch, getState, { firebase }) => {
    const router = getState().router;
    if (router.routeData && router.routeData[path] && router.routeData[path].load)
        dispatch(loadFlagAction({ path: path, load: false }));

    if (path === "mainModule__table") {
        firebase.db
            .collection("users")
            .get()
            .then(function(querySnapshot) {
                const users = [];
                querySnapshot.forEach(function(doc) {
                    users.push(doc.data());
                });
                return users;
            })
            .then(users => {
                dispatch(saveComponentStateAction({ users: users, load: true, path }));
            });
    } else if (path.startsWith("taskModule_")) {
        firebase.db
            .collection("tasks")
            .get()
            .then(function(querySnapshot) {
                const tasks = [];
                querySnapshot.forEach(function(doc) {
                    tasks.push(doc.data());
                });
                return tasks;
            })
            .then(tasks => {
                dispatch(saveComponentStateAction({ tasks: tasks, load: true, path }));
            });
    }
};
