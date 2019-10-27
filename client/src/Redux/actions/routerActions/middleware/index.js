import { USER_SCHEMA, TASK_SCHEMA } from "Utils/schema/const";
import { saveComponentStateAction, loadFlagAction } from "../";

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
                dispatch(saveComponentStateAction({ users: usersCopy, load: true, path: "mainModule" }));
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
