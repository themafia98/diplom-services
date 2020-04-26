import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import Utils from '../../../Utils';
import _ from 'lodash';
const { getModelByName } = Utils;

class ActionJurnal implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private async getJurnal(actionParam: ActionParams, model: Model<Document>): ParserData {
    const { depKey } = actionParam;
    const conditions = { depKey };
    const actionData: Document[] | null = await this.getEntity().getAll(model, conditions);
    return actionData;
  }

  private async setJurnal(actionParam: ActionParams, model: Model<Document>): ParserData {
    try {
      const { item = {} } = actionParam;
      const actionData: Document | null = await this.getEntity().createEntity(model, <object>item);

      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async run(actionParam: ActionParams): ParserData {
    const model: Model<Document> | null = getModelByName('jurnalworks', 'jurnalworks');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case '__getJurnal':
        // Get jurnal action. Starts with '__set' journals key because
        // set for synchronize with client key
        return this.getJurnal(actionParam, model);
      case 'set_jurnal':
        return this.setJurnal(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionJurnal;
