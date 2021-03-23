import Utils from '../../../Utils/utils.global';
import { Model, Document } from 'mongoose';
import { ActionParams, Action, QueryParams, Parser } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import _ from 'lodash';
import { GLOBAL_ACTION_TYPE } from '../ActionEntity.global.constant';
import ActionEntity from '../../ActionEntity/ActionEntity';
import { ENTITY } from '../../Database/Schema/Schema.constant';

const { getModelByName } = Utils;

class ActionNotification implements Action {
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

  public async create(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    const { item = null } = actionParam as Record<string, object>;

    if (!item) return null;

    const result = await this.getEntityParser().createEntity(model, item);
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
      const count = await this.getEntityParser().getCounter(model, privateCountQuery);

      const result = await this.getEntityParser().getAll(
        model,
        { type: concactType, ...privateMethodQuery },
        limitList as number | null,
        skip as number,
        'asc',
      );
      return { result, count };
    }

    const query = isObject ? { type: concactType, ...(ids as object) } : { type: concactType };

    const result = await this.getEntityParser().getAll(
      model,
      query,
      limitList as number | null,
      skip as number,
      'asc',
    );

    const count = await this.getEntityParser().getCounter(model, query);

    return { result, count };
  }

  private async updateMany(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { params = {} } = actionParam;
    const { options = {} } = params as Record<string, object>;
    const queryParams: QueryParams = { queryType: 'many', actionParam: options };

    const result = await this.getEntityParser().updateEntity(model, queryParams);
    return result;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName(ENTITY.NOTIFICATION, ENTITY.NOTIFICATION);
    if (!model) return null;

    const typeAction: string = this.getEntity().getActionType();

    switch (typeAction) {
      case GLOBAL_ACTION_TYPE.UPDATE_MANY:
        return await this.updateMany(actionParam, model);
      default:
        if (typeAction.includes('set')) return this.create(model, actionParam);
        return await this.getByType(actionParam, model);
    }
  }
}

export default ActionNotification;
