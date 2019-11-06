import { USER_SCHEMA, TASK_SCHEMA } from "../../../../Utils/schema/const";
import { saveComponentStateAction, loadFlagAction } from "../";
import { errorRequstAction, setStatus } from "../../publicActions";

export const loadCurrentData = path => (dispatch, getState, { firebase, getSchema, request, clientDB }) => {
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
                .then(querySnapshot => {
                    const { metadata: { fromCache = null } = {} } = querySnapshot;
                    const users = [];
                    querySnapshot.forEach(doc => {
                        users.push(doc.data());
                    });
                    if (users.length) return users;
                    else if (fromCache && !users.length) throw new Error("Network error");
                    else throw new Error("Bad requst or no data");
                })
                .then(users => {
                    const usersCopyStore = [...users];
                    const undefiendUsers = [];
                    const cursor = clientDB.getCursor("users");

                    cursor.onsuccess = async event => {
                        const {
                            target: { result: cursor },
                        } = event;
                        if (!cursor) return await next(true);

                        if (usersCopyStore && usersCopyStore.findIndex(user => user.uuid === cursor.key) === -1) {
                            usersCopyStore.push({ ...cursor.value });
                            undefiendUsers.push({ ...cursor.value });
                        }
                        cursor.continue();
                    };

                    const next = async (flag = false) => {
                        let usersCopy = usersCopyStore.map(it => getSchema(USER_SCHEMA, it)).filter(Boolean);
                        if (!usersCopy.length) return;

                        usersCopy.forEach(user => {
                            clientDB.updateItem("users", user);
                        });

                        const onAction = () => {
                            if (requestError !== null) dispatch(errorRequstAction(null));
                            dispatch(saveComponentStateAction({ users: usersCopy, load: true, path: pathValid }));
                        };

                        if (flag && undefiendUsers.length) {
                            const tasks = firebase.db.collection("users");
                            const batch = firebase.db.batch();
                            undefiendUsers.forEach(task => {
                                const taskRef = tasks.doc();
                                batch.set(taskRef, task);
                            });
                            await batch.commit();
                            onAction();
                        } else onAction();
                    };
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
        } else {
            const users = clientDB.getAllItems("users");
            users.onsuccess = event => {
                const {
                    target: { result },
                } = event;
                const usersCopy = result.map(it => getSchema(USER_SCHEMA, it)).filter(Boolean);
                dispatch(saveComponentStateAction({ users: usersCopy, load: true, path: pathValid, mode: "offline" }));
            };
        }
    } else if (pathValid === "taskModule") {
        if (status === "online") {
            firebase.db
                .collection("tasks")
                .get()
                .then(querySnapshot => {
                    const { metadata: { fromCache = null } = {} } = querySnapshot;
                    const tasks = [];
                    querySnapshot.forEach(doc => {
                        tasks.push(doc.data());
                    });
                    if (tasks.length) return tasks;
                    else if (fromCache && !tasks.length) throw new Error("Network error");
                })
                .then(tasks => {
                    const tasksCopyStore = [...tasks];
                    const undefiendTasks = [];
                    const cursor = clientDB.getCursor("tasks");

                    cursor.onsuccess = async event => {
                        const {
                            target: { result: cursor },
                        } = event;
                        if (!cursor) return await next(true);

                        if (tasksCopyStore && tasksCopyStore.findIndex(task => task.key === cursor.key) === -1) {
                            tasksCopyStore.push({ ...cursor.value });
                            undefiendTasks.push({ ...cursor.value });
                        }
                        cursor.continue();
                    };

                    const next = async (flag = false) => {
                        const tasksCopy = tasksCopyStore
                            .map(it => getSchema(TASK_SCHEMA, it, "no-strict"))
                            .filter(Boolean);
                        if (!tasksCopy.length) return;

                        tasksCopy.forEach(task => {
                            clientDB.updateItem("tasks", task);
                        });

                        const onAction = () => {
                            if (requestError !== null) dispatch(errorRequstAction(false));
                            dispatch(saveComponentStateAction({ tasks: tasksCopy, load: true, path: pathValid }));
                        };

                        const tasks = firebase.db.collection("tasks");
                        const batch = firebase.db.batch();
                        undefiendTasks.forEach(task => {
                            const taskRef = tasks.doc();
                            batch.set(taskRef, task);
                        });
                        await batch.commit();

                        onAction();
                    };
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
        } else {
            const users = clientDB.getAllItems("tasks");
            users.onsuccess = event => {
                const {
                    target: { result },
                } = event;
                const tasksCopy = result.map(it => getSchema(TASK_SCHEMA, it, "no-strict")).filter(Boolean);
                dispatch(saveComponentStateAction({ tasks: tasksCopy, load: true, path: pathValid, mode: "offline" }));
            };
        }
    }
};
