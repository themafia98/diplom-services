import _ from "lodash";
import { сachingAction, setStatus, errorRequstAction } from "../";
import { updateItemStateAction } from "../../routerActions";
import { TASK_CONTROLL_JURNAL_SCHEMA, USER_SCHEMA, TASK_SCHEMA } from "../../../../Models/Schema/const";

const middlewareCaching = (props) => (dispatch, getState, schema, Request, clientDB) => {
    const { data, primaryKey, type = "GET", pk = null, store = "" } = props;
    const { requestError, status = "online" } = getState().publicReducer;

};

const middlewareUpdate = async (props) => async (dispatch, getState, { schema, Request, clientDB }) => {
    const {
        id,
        path = "",
        type = "UPDATE",
        updateProp = "",
        updateFild = "",
        item: itemUpdate = {},
        store,
        multiply = false,
        limitUpdate = 20
    } = props || {};




}

export { middlewareCaching, middlewareUpdate };
