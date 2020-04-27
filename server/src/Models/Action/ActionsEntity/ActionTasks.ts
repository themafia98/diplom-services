import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import Utils from '../../../Utils';
import _ from 'lodash';
const { getModelByName } = Utils;

class ActionTasks implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  public async createSingleTask(actionParam: ActionParams, model: Model<Document>): ParserData {
    try {
      const actionData: Document | null = await this.getEntity().createEntity(model, actionParam);
      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async update(actionParam: ActionParams, model: Model<Document>, typeAction: string): ParserData {
    try {
      /** Params for query */
      const { queryParams = {}, updateItem = '' } = actionParam;
      const id: string = (queryParams as Record<string, string>).id;

      let updateProps = {};
      let actionData: Document | null = null;

      if (typeAction.includes('single')) {
        const updateField: string = (actionParam as Record<string, string>).updateField;
        (updateProps as Record<string, string>)[updateField] = <string>updateItem;
      } else if (typeAction.includes('many')) {
        const { updateItem = '' } = actionParam;
        updateProps = updateItem;
      }

      await model.updateOne({ _id: id }, updateProps);
      actionData = await model.findById(id);

      return actionData;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  private async getTasks(actionParam: ActionParams, model: Model<Document>): ParserData {
    const { queryParams, limitList = 10, saveData = {} } = actionParam || {};
    const { pagination = null } = <Record<string, any>>saveData;
    const params: ActionParams =
      _.isEmpty(queryParams) || !(<Record<string, string[]>>queryParams)?.keys
        ? {}
        : <ActionParams>queryParams;

    const query = {
      where: 'key',
      in: (<Record<string, string[]>>queryParams)?.keys,
    };

    const paramsList: ActionParams = _.isEmpty(params) ? params : query;
    const isPagerParams = pagination && pagination?.current && pagination?.pageSize;
    const skip: number = isPagerParams && limitList ? (pagination.current - 1) * pagination.pageSize : 0;
    return this.getEntity().getAll(model, paramsList, <number | null>limitList, skip);
  }

  public async run(actionParam: ActionParams): ParserData {
    const model: Model<Document> | null = getModelByName('tasks', 'task');
    if (!model) return null;

    const typeAction: string = this.getEntity().getActionType();

    switch (typeAction) {
      case 'get_all':
        return this.getTasks(actionParam, model);
      case 'set_single':
        return this.createSingleTask(actionParam, model);
      case 'list_counter':
        return await this.getEntity().getCounter(model);
      default: {
        if (typeAction.includes('update_')) return this.update(actionParam, model, typeAction);
        return null;
      }
    }
  }
}

export default ActionTasks;
