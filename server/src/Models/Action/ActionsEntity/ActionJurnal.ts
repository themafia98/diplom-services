import { Model, Document, Types, isValidObjectId } from 'mongoose';
import _ from 'lodash';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import Utils from '../../../Utils/utils.global';

const { getModelByName } = Utils;

class ActionJournal implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private async getJurnal(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { depKey: dirtyKey = '' } = actionParam as Record<string, string>;

    if (!isValidObjectId(dirtyKey)) return null;

    const depKey = Types.ObjectId(dirtyKey);

    if (!depKey) return null;

    const conditions = { depKey };
    const actionData: ParserData = await this.getEntity().getAll(model, conditions);
    return actionData;
  }

  private async setJournal(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    try {
      const { item = {} } = actionParam as Record<string, object>;
      const { depKey: dirtyKey = '' } = (item as Record<string, string>) || {};
      const depKey = Types.ObjectId(dirtyKey);

      if (!depKey) return null;

      const jurnalItem = { ...item, depKey };
      const actionData: ParserData = await this.getEntity().createEntity(model, jurnalItem);

      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('jurnalworks', 'jurnalworks');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case '__getJurnal':
        // Get jurnal action. Starts with '__set' journals key because
        // set for synchronize with client key
        return this.getJurnal(actionParam, model);
      case 'set_jurnal':
        return this.setJournal(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionJournal;
