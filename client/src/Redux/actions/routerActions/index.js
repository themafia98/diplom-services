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
import { USER_SCHEMA, TASK_SCHEMA } from "../../../Utils/schema/const";
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

export const loadFlagAction = state => {
    return {
        type: SET_FLAG_LOAD_DATA,
        payload: state,
    };
};

// middlewares

export const logoutAction = state => {
    return dispatch => {
        dispatch(setLogoutTabs());
        dispatch(logoutRouterAction());
    };
};

export const saveTaskAction = (path, dataTask) => (dispatch, getState, { firebase, getSchema }) => {
    // if (path.startsWith("taskModule_")) {
    //     const dataTaskCopy = dataTask.map(it => getSchema(TASK_SCHEMA, it)).filter(Boolean);
    // }
};

export const loadCurrentData = path => (dispatch, getState, { firebase, getSchema }) => {
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
                const usersCopy = users.map(it => getSchema(USER_SCHEMA, it)).filter(Boolean);
                dispatch(saveComponentStateAction({ users: usersCopy, load: true, path }));
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
                const tasksCopy = tasks.map(it => getSchema(TASK_SCHEMA, it, "no-strict")).filter(Boolean);
                dispatch(saveComponentStateAction({ tasks: tasksCopy, load: true, path }));
            });
    }
};
