import { Model, Document, Types } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import Utils from '../../../Utils';
import _ from 'lodash';
import { ObjectId } from 'mongodb';
const { getModelByName } = Utils;

class ActionNews implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private getNews(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams, limitList = null } = actionParam || {};
    const { keys = [] } = <Record<string, string[]>>queryParams || {};
    const params: ActionParams =
      _.isEmpty(queryParams) || !(<Record<string, string[]>>queryParams)?.keys
        ? {}
        : <ActionParams>queryParams;
    const parsedKeys: Array<ObjectId> = keys.map((id) => Types.ObjectId(id));
    const query = {
      where: '_id',
      in: parsedKeys,
    };

    return this.getEntity().getAll(model, _.isEmpty(params) ? params : query, <number | null>limitList);
  }

  private createNews(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const body: object = <Record<string, any>>actionParam || {};
    return this.getEntity().createEntity(model, body);
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('news', 'news');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'get_all':
        return this.getNews(actionParam, model);
      case 'create_single_news':
        return this.createNews(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionNews;
