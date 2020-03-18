import Utils from '../../../Utils';
import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import _ from 'lodash';

const { getModelByName } = Utils;

class ActionNotification implements Action {

    constructor(private entity:Actions) {}

    public getEntity(): Actions {
        return this.entity;
    }

    public runGlobal(actionParam: ActionParams): any {}

    public runMass(actionParam: ActionParams): any {}

    public async run(actionParam: ActionParams): ParserData {
        const model: Model<Document> | null = getModelByName("notification", "notification");
        if (!model) return null;

        const { type = "" } = actionParam;

        switch(type){
            case "global": {
                return this.runGlobal(actionParam);
            }
            case "mass": {
                return this.runMass(actionParam);
            }
            default: {
                return null;
            }
        }
    }

};

export default ActionNotification;