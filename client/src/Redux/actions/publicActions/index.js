/** Here action constants import */
import { SET_ERROR } from "./const";

export const errorRequstAction = state => {
    return {
        type: SET_ERROR,
        payload: state,
    };
};
