import { Model, Document, Types } from 'mongoose';
import { ActionParams, Action, QueryParams, Parser } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import Utils from '../../../Utils/utils.global';
import _ from 'lodash';
import { ObjectId } from 'mongodb';
import { ACTION_TYPE } from './ActionNews.constant';
import ActionEntity from '../../ActionEntity/ActionEntity';
const { getModelByName } = Utils;

class ActionNews implements Action {
  private entityParser: Parser;
  private entity: ActionEntity;

  constructor(entityParser: Parser, entity: ActionEntity) {
    this.entityParser = entityParser;
    this.entity = entity;
  }

  public getEntityParser(): Parser {
    return this.entityParser;
  }

  public getEntity(): ActionEntity {
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

    return this.getEntityParser().getAll(
      model,
      _.isEmpty(params) ? params : query,
      limitList as number | null,
    );
  }

  private createNews(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const body: object = (actionParam as Record<string, object>) || {};
    return this.getEntityParser().createEntity(model, body);
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('news', 'news');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case ACTION_TYPE.ALL_NEWS:
        return this.getNews(actionParam, model);
      case ACTION_TYPE.CREATE_NEWS:
        return this.createNews(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionNews;
