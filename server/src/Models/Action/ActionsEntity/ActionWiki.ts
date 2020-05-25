import { Model, Document, Types } from 'mongoose';
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

  private async getTreeList(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    return this.getEntity().getAll(model, actionParam);
  }

  private async createLeaf(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { item = null } = actionParam || {};

    if (!item || (item && _.isEmpty(item))) return null;

    return this.getEntity().createEntity(model, item as object);
  }

  private async deleteLeafs(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = null } = (actionParam as Record<string, Array<string>>) || {};

    if (!queryParams || (queryParams && _.isEmpty(queryParams))) return null;

    const query: ActionParams = {
      multiple: true,
      mode: 'many',
      findBy: '_id',
      queryParams,
    };

    return this.getEntity().deleteEntity(model, query);
  }

  private async getWikiPage(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { methodQuery = {} } = actionParam as Record<string, ActionParams>;
    const result = await this.getEntity().findOnce(model, methodQuery);
    return result;
  }

  private async update(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    try {
      const { queryParams = {}, updateItem: updateProps = {} } = actionParam as Record<string, object>;
      const { pageId: _id } = queryParams as Record<string, string>;
      const isVirtual = _id.includes('virtual');

      if (isVirtual) {
        const actionData: ParserData = await this.getEntity().createEntity(model, updateProps);
        return actionData;
      }

      const queryFind: ActionParams = { _id: Types.ObjectId(_id) };
      const query: ActionParams = { _id: Types.ObjectId(_id), updateProps };

      await this.getEntity().updateEntity(model, query);
      const actionData: ParserData = await this.getEntity().findOnce(model, queryFind);

      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const { type = 'wikiTree' } = actionParam as Record<string, string>;
    const model: Model<Document> | null = getModelByName(type, type);
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'get_all':
        return this.getTreeList(actionParam, model);
      case 'create_leaf':
        return this.createLeaf(actionParam, model);
      case 'delete_leafs':
        return this.deleteLeafs(actionParam, model);
      case 'update_single':
        return this.update(actionParam, model);
      case 'wiki_page':
        return this.getWikiPage(actionParam, model);
      default:
        return null;
    }
  }
}
export default ActionWiki;
