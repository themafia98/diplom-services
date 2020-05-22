import Utils from '../../../Utils';
import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
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
    const { methodQuery = {}, type = 'global' } = actionParam as Record<string, object>;

    const concactType = (type as string) === 'private' ? ['private', 'global'] : type;

    if (_.isEmpty(methodQuery) && (type as string) === 'private') {
      return null;
    }

    if (Array.isArray(concactType)) {
      const privateMethodQuery = {
        where: 'type',
        in: concactType,
        and: [
          {
            ...methodQuery,
          },
        ],
      };

      const result = await this.getEntity().getAll(
        model,
        { type: concactType, ...privateMethodQuery },
        null,
        0,
        'asc',
      );
      return result;
    }

    const result = await this.getEntity().getAll(
      model,
      { type: concactType, ...methodQuery },
      null,
      0,
      'asc',
    );
    return result;
  }

  private async updateMany(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const methodQuery = { queryType: 'many', actionParam };

    const result = await this.getEntity().updateEntity(model, methodQuery);
    return result;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('notification', 'notification');
    if (!model) return null;

    const actionType: string = this.getEntity().getActionType();

    if (actionType === 'update_many') {
      const result = await this.updateMany(actionParam, model);
      return result;
    }

    if (actionType.includes('set')) return this.create(model, actionParam);

    const result = await this.getByType(actionParam, model);
    return result;
  }
}

export default ActionNotification;
