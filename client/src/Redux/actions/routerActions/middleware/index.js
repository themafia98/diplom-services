import { USER_SCHEMA, TASK_SCHEMA } from "Utils/schema/const";
import { saveComponentStateAction, loadFlagAction } from "../";

export const loadCurrentData = path => (dispatch, getState, { firebase, getSchema }) => {
    const router = getState().router;
    const pathValid = path.startsWith("taskModule_") ? "taskModule" : path.split("__")[0];
    if (router.routeData && router.routeData[pathValid] && router.routeData[pathValid].load)
        dispatch(loadFlagAction({ path: pathValid, load: false }));

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
                dispatch(saveComponentStateAction({ users: usersCopy, load: true, path: pathValid }));
            });
    } else if (pathValid === "taskModule") {
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
                dispatch(saveComponentStateAction({ tasks: tasksCopy, load: true, path: pathValid }));
            });
    }
};
