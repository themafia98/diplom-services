import { USER_SCHEMA, TASK_SCHEMA } from "../../../../Utils/schema/const";
import { saveComponentStateAction, loadFlagAction } from "../";
import { errorRequstAction, setStatus } from "../../publicActions";

export const loadCurrentData = path => (dispatch, getState, { firebase, getSchema, request }) => {
    const router = getState().router;
    const { requestError, status = "online" } = getState().publicReducer;
    const pathValid = path.startsWith("taskModule_") ? "taskModule" : path.split("__")[0];
    if (router.routeData && router.routeData[pathValid] && router.routeData[pathValid].load)
        dispatch(loadFlagAction({ path: pathValid, load: false }));

    if (path === "mainModule__table") {
        if (status === "online") {
            firebase.db
                .collection("users")
                .get()
                .then(function(querySnapshot) {
                    const { metadata: { fromCache = null } = {} } = querySnapshot;
                    const users = [];
                    querySnapshot.forEach(function(doc) {
                        users.push(doc.data());
                    });
                    if (users.length) return users;
                    else if (fromCache && !users.length) throw new Error("Network error");
                    else throw new Error("Bad requst or no data");
                })
                .then(users => {
                    const usersCopy = users.map(it => getSchema(USER_SCHEMA, it)).filter(Boolean);
                    if (requestError !== null) dispatch(errorRequstAction(null));
                    dispatch(saveComponentStateAction({ users: usersCopy, load: true, path: pathValid }));
                })
                .catch(error => {
                    dispatch(setStatus("offline"));
                    dispatch(errorRequstAction(error.message));
                    request.follow(
                        "offline",
                        statusRequst => {
                            if (getState().publicReducer.status !== statusRequst && statusRequst === "online") {
                                request.unfollow();
                                dispatch(setStatus(statusRequst));
                                dispatch(errorRequstAction(null));
                                dispatch(loadCurrentData(path));
                            }
                        },
                        3000,
                    );
                });
        } else return null;
    } else if (pathValid === "taskModule") {
        if (status === "online") {
            firebase.db
                .collection("tasks")
                .get()
                .then(function(querySnapshot) {
                    const { metadata: { fromCache = null } = {} } = querySnapshot;
                    const tasks = [];
                    querySnapshot.forEach(function(doc) {
                        tasks.push(doc.data());
                    });
                    if (tasks.length) return tasks;
                    else if (fromCache && !tasks.length) throw new Error("Network error");
                })
                .then(tasks => {
                    const tasksCopy = tasks.map(it => getSchema(TASK_SCHEMA, it, "no-strict")).filter(Boolean);
                    if (requestError !== null) dispatch(errorRequstAction(false));
                    dispatch(saveComponentStateAction({ tasks: tasksCopy, load: true, path: pathValid }));
                })
                .catch(error => {
                    dispatch(setStatus("offline"));
                    dispatch(errorRequstAction(error.message));
                    request.follow(
                        "offline",
                        statusRequst => {
                            if (getState().publicReducer.status !== statusRequst && statusRequst === "online") {
                                request.unfollow();
                                dispatch(setStatus(statusRequst));
                                dispatch(errorRequstAction(null));
                                dispatch(loadCurrentData(path));
                            }
                        },
                        3000,
                    );
                });
        } else return null;
    }
};
