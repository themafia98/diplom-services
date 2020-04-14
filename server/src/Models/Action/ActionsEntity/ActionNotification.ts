import Utils from '../../../Utils';
import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData, ParserResult } from '../../../Utils/Types';
import _ from 'lodash';

const { getModelByName } = Utils;

class ActionNotification implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  public async create(model: Model<Document>, actionParam: ActionParams) {
    const { item = null } = <Record<string, object>>actionParam;

    if (!item) return null;

    return await this.getEntity().createEntity(model, item);
  }

  public async getByType(actionParam: ActionParams, model: Model<Document>): Promise<Document> {
    const { methodQuery = {}, type = 'global' } = <Record<string, object>>actionParam;

    const concactType = <string>type === 'private' ? 'global' : type;

    return await this.getEntity().getAll(model, { type: concactType, ...methodQuery });
  }

  public async run(actionParam: ActionParams): ParserData {
    const model: Model<Document> | null = getModelByName('notification', 'notification');
    if (!model) return null;

    const actionType: string = this.getEntity().getActionType();

    if (actionType.includes('set')) return this.create(model, actionParam);

    return await this.getByType(actionParam, model);
  }
}

export default ActionNotification;
