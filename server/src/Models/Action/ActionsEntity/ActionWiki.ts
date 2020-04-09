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

  private async createLeaf(actionParam: ActionParams, model: Model<Document>): ParserData {
    const { item = null } = <Record<string, object>>actionParam || {};

    if (!item || (item && _.isEmpty(item))) return null;

    return this.getEntity().createEntity(model, item);
  }

  private async deleteLeafs(actionParam: ActionParams, model: Model<Document>): ParserData {
    const { ids = [] } = <Record<string, Array<string>>>actionParam || {};

    if (!ids || (ids && !ids?.length)) return null;

    const query: ActionParams = {
      multiple: true,
      findBy: '_id',
      queryParams: { ids },
    };

    return this.getEntity().deleteEntity(model, query);
  }

  public async run(actionParam: ActionParams): ParserData {
    const { type = 'wikiTree' } = <Record<string, string>>actionParam;
    const model: Model<Document> | null = getModelByName(type, type);
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'get_all':
        return this.getTreeList(actionParam, model);
      case 'create_leaf':
        return this.createLeaf(actionParam, model);
      default:
      case 'delete_leafs':
        return this.deleteLeafs(actionParam, model);
        return null;
    }
  }
}
export default ActionWiki;
