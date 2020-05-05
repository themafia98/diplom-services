import { Model, Document, Types, FilterQuery } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import Utils from '../../../Utils';
import _ from 'lodash';
import { ObjectID } from 'mongodb';
const { getModelByName } = Utils;

class ActionTasks implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  public async createSingleTask(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    try {
      const actionData: ParserData = await this.getEntity().createEntity(model, actionParam);
      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  public async update(
    actionParam: ActionParams,
    model: Model<Document>,
    typeAction: string,
  ): Promise<ParserData> {
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

  private async getTasks(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams, limitList = 20, saveData = {}, filterCounter = '' } = actionParam || {};
    const _id: ObjectID = Types.ObjectId(<string>filterCounter);

    const { pagination = null } = <Record<string, any>>saveData;
    const params: ActionParams =
      _.isEmpty(queryParams) || !(<Record<string, string[]>>queryParams).keys
        ? {}
        : <ActionParams>queryParams;
    const filter: Record<string, Array<object>> = await this.getDataByFilter(
      actionParam,
      _id ? <string>filterCounter : null,
    );
    const query = {
      where: 'key',
      in: (<Record<string, string[]>>queryParams).keys,
      filter,
    };

    const paramsList: ActionParams = _.isEmpty(params) ? { ...params, ...filter } : query;

    const isPagerParams = pagination && pagination.current && pagination.pageSize;
    const skip: number = isPagerParams && limitList ? (pagination.current - 1) * pagination.pageSize : 0;
    return this.getEntity().getAll(model, paramsList, <number | null>limitList, skip);
  }

  private async getTaskCount(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    const { filterCounter = null } = actionParam as Record<string, null | string>;

    const filter: any = await this.getDataByFilter(actionParam);
    const filterList = filter['$or'] || [{}];

    const filterListValid: Array<object> = filterList.every((obj: object) => _.isEmpty(obj))
      ? !filterCounter
        ? [{}]
        : []
      : filterList;

    const query: Readonly<FilterQuery<object>> = !filterCounter
      ? { $or: filterListValid }
      : {
          $or: [
            { editor: { $elemMatch: { $eq: filterCounter } } },
            { uidCreater: { $eq: filterCounter } },
            ...filterListValid,
          ],
        };

    return await this.getEntity().getCounter(model, query);
  }

  private async getDataByFilter(
    actionParam: ActionParams,
    id: string | null = null,
  ): Promise<Record<string, Array<object>>> {
    const { saveData: { filteredInfo = {}, arrayKeys = [] } = {} } = actionParam as Record<string, any>;

    const filteredKeys: Array<string> = Object.keys(filteredInfo);
    if (!filteredKeys.length && !id) return {};

    if (!filteredKeys.length && id) {
      return {
        $or: [{ editor: { $elemMatch: { $eq: id } } }, { uidCreater: { $eq: id } }],
      };
    }

    const filter: Record<string, Array<object>> = { $or: [] };

    filteredKeys.forEach((key: string) => {
      const parsedPatterns: string | Array<string> =
        _.isArray(filteredInfo[key]) && filteredInfo[key].every((it: string) => _.isString(it))
          ? filteredInfo[key].map((val: string) => val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
          : filteredInfo[key];

      const condtion: Readonly<Array<RegExp>> = (<string[]>parsedPatterns).map(
        (pattern: string) => new RegExp(pattern, 'gi'),
      );
      const query = !arrayKeys.some((arrKey: string) => key === arrKey)
        ? { [key]: { $in: condtion } }
        : { [key]: { $elemMatch: { $in: condtion } } };

      if (key && condtion) filter.$or.push(query);
    });

    if (id) {
      filter.$and = [];

      filter.$and.push({ $or: [{ editor: { $elemMatch: { $eq: id } } }, { uidCreater: { $eq: id } }] });
    }

    return !filter['$or'].length ? { $or: [{}] } : filter;
  }

  private async getStats(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    const { queryParams = {} } = actionParam as Record<string, object>;
    const { type = '', todayISO = '', limitList = '', queryType = '' } = actionParam as Record<string, string>;
    const { statsListFields = [] } = (queryParams as Record<string, Array<string>>) || {};
    const dateQuery: object = todayISO && queryType !== 'full'
      ? { createdAt: { $gte: new Date(todayISO) } }
      : queryType === 'full' && todayISO && limitList
      ? { createdAt: { $lte: new Date(todayISO) } }
      : {};

    if (!statsListFields || (statsListFields && !statsListFields.length)) {
      return null;
    }

    const metadata: Record<string, number | object> = {};
    if (type) metadata[type] = {};

    for await (let field of statsListFields) {
      const dataField: number = await this.getEntity().getCounter(model, {
        ...dateQuery,
        status: field
      }, limitList ? { limit: limitList } : undefined);

      if (!dataField) continue;

      if (type && metadata[type]) {
        const alias = metadata[type] as Record<string, number>;
        alias[field] = dataField;
      } else metadata[field] = dataField;
    }

    return <ParserData>metadata;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('tasks', 'task');
    if (!model) return null;

    const typeAction: string = this.getEntity().getActionType();

    switch (typeAction) {
      case 'get_all':
        return this.getTasks(actionParam, model);
      case 'set_single':
        return this.createSingleTask(actionParam, model);
      case 'list_counter':
        return await this.getTaskCount(model, actionParam);
      case 'get_stats':
        return await this.getStats(model, actionParam);
      default: {
        if (typeAction.includes('update_')) return this.update(actionParam, model, typeAction);
        return null;
      }
    }
  }
}

export default ActionTasks;
