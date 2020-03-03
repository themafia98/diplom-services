
import { ActionParams, Actions, Action } from "../../../Utils/Interfaces";
import { ParserData } from "../../../Utils/Types";
import { files } from "dropbox";
import _ from "lodash";

class ActionLogger implements Action {
    constructor(private entity: Actions) { }

    public getEntity(): Actions {
        return this.entity;
    }


    public async run(actionParam: ActionParams): ParserData {
        return null;
    }
};

export default ActionLogger;