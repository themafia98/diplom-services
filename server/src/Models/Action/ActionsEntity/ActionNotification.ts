import Utils from '../../../Utils';
import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action, QueryParams } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import _ from 'lodash';

const { getModelByName } = Utils;

class ActionNotification implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  public async create(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    const { item = null } = actionParam as Record<string, object>;

    if (!item) return null;

    const result = await this.getEntity().createEntity(model, item);
    return result;
  }

  public async getByType(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const {
      ids = {},
      type = 'global',
      limitList = Number.MAX_SAFE_INTEGER,
      skip = 0,
    } = actionParam as Record<string, object | number>;

    const concactType = (type as string) === 'private' ? ['private', 'global'] : type;
    const isObject = ids && typeof ids === 'object';

    if (!isObject || (_.isEmpty(ids) && (type as string) === 'private')) {
      return null;
    }

    if (Array.isArray(concactType) && isObject) {
      const privateMethodQuery = {
        where: 'type',
        in: concactType,
        and: [
          {
            ...(ids as object),
          },
        ],
      };

      const privateCountQuery = { type: { $in: concactType }, ...(ids as object) };
      const count = await this.getEntity().getCounter(model, privateCountQuery);

      const result = await this.getEntity().getAll(
        model,
        { type: concactType, ...privateMethodQuery },
        limitList as number | null,
        skip as number,
        'asc',
      );
      return { result, count };
    }

    const query = isObject ? { type: concactType, ...(ids as object) } : { type: concactType };

    const result = await this.getEntity().getAll(
      model,
      query,
      limitList as number | null,
      skip as number,
      'asc',
    );

    const count = await this.getEntity().getCounter(model, query);

    return { result, count };
  }

  private async updateMany(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { params = {} } = actionParam;
    const { options = {} } = params as Record<string, object>;
    const queryParams: QueryParams = { queryType: 'many', actionParam: options };

    const result = await this.getEntity().updateEntity(model, queryParams);
    return result;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('notification', 'notification');
    if (!model) return null;

    const typeAction: string = this.getEntity().getActionType();

    switch (typeAction) {
      case 'update_many':
        return await this.updateMany(actionParam, model);
      default:
        if (typeAction.includes('set')) return this.create(model, actionParam);
        return await this.getByType(actionParam, model);
    }
  }
}

export default ActionNotification;
