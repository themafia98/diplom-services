import { Model, Document, Types } from 'mongoose';
import { ActionParams, Actions, Action, QueryParams } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import Utils from '../../../Utils/utils.global';
import _ from 'lodash';
import { ObjectId } from 'mongodb';
const { getModelByName } = Utils;

class ActionNews implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private getNews(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams, limitList = null } = (actionParam as Record<string, QueryParams>) || {};
    const { keys = [] } = queryParams || {};

    const params: ActionParams =
      _.isEmpty(queryParams) || !queryParams.keys ? {} : (queryParams as ActionParams);
    const parsedKeys: Array<ObjectId> = (<Array<string>>keys).map((id) => Types.ObjectId(id));
    const query = {
      where: '_id',
      in: parsedKeys,
    };

    return this.getEntity().getAll(model, _.isEmpty(params) ? params : query, limitList as number | null);
  }

  private createNews(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const body: object = (actionParam as Record<string, object>) || {};
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
