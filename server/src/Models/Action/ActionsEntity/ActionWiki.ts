import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import Utils from '../../../Utils';
import _ from 'lodash';

const { getModelByName } = Utils;

class ActionWiki implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private async getTreeList(actionParam: ActionParams, model: Model<Document>): ParserData {
    return this.getEntity().getAll(model, actionParam);
  }

  public async run(actionParam: ActionParams): ParserData {
    const model: Model<Document> | null = getModelByName('wikiTree', 'wikiTree');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'get_all':
        return this.getTreeList(actionParam, model);

      default:
        return null;
    }
  }
}
export default ActionWiki;
