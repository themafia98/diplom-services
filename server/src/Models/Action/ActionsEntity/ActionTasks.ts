import { Model, Document, Types, isValidObjectId } from 'mongoose';
import { ActionParams, Actions, Action, TicketRemote } from '../../../Utils/Interfaces';
import { ParserData, Pagination } from '../../../Utils/Types';
import Utils from '../../../Utils';
import _ from 'lodash';
import { ObjectID } from 'mongodb';
const { getModelByName, generateRemoteTask, getFilterQuery, parseFilterFields } = Utils;

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
        (updateProps as Record<string, string>)[updateField] = updateItem as string;
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
    const _id: ObjectID | string =
      filterCounter && isValidObjectId(filterCounter) ? Types.ObjectId(filterCounter as string) : '';

    const {
      paginationState: initialPagination = null,
      pagination: nextPagination = null,
    } = saveData as Record<string, any>;
    const pagination: Pagination = initialPagination ? initialPagination : nextPagination;

    const params: ActionParams =
      _.isEmpty(queryParams) || !(queryParams as Record<string, string[]>).keys
        ? {}
        : (queryParams as ActionParams);
    const { keys = [] } = (queryParams as Record<string, string[]>) || {};
    const parsedKeys: Array<Types.ObjectId> = Array.isArray(keys)
      ? keys.reduce((keysList: Array<Types.ObjectId>, key: string) => {
          if (key && isValidObjectId(key)) return [...keysList, Types.ObjectId(key)];

          return keysList;
        }, [])
      : keys;

    const filter: Record<string, Array<object>> = getFilterQuery(
      actionParam,
      _id,
      parseFilterFields([{ editor: 'regexp' }, { uidCreater: 'equal' }], _id),
    );

    const query = {
      where: '_id',
      in: parsedKeys,
      filter,
    };

    const paramsList: ActionParams = _.isEmpty(params) ? { ...params, ...filter } : query;

    const isPagerParams = pagination && pagination.current && pagination.pageSize;
    const skip: number = isPagerParams && limitList ? (pagination.current - 1) * pagination.pageSize : 0;
    return this.getEntity().getAll(model, paramsList, limitList as number | null, skip);
  }

  private async getTaskCount(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    const { filterCounter = '' } = actionParam as Record<string, null | string>;
    const _id: ObjectID | string = isValidObjectId(filterCounter)
      ? Types.ObjectId(filterCounter as string)
      : '';

    const filter: Record<string, Array<object>> = getFilterQuery(
      actionParam,
      _id,
      parseFilterFields([{ editor: 'regexp' }, { uidCreater: 'equal' }], filterCounter as string),
    );

    return await this.getEntity().getCounter(model, filter);
  }

  private async getStats(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    const { queryParams = {} } = actionParam as Record<string, object>;
    const { type = '', todayISO = '', limitList = '', queryType = '' } = actionParam as Record<
      string,
      string
    >;

    const { statsListFields = [] } = (queryParams as Record<string, Array<string>>) || {};
    const dateQuery: object =
      todayISO && queryType !== 'full'
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
      const dataField: number = await this.getEntity().getCounter(
        model,
        {
          ...dateQuery,
          status: field,
        },
        limitList ? { limit: limitList } : undefined,
      );

      if (!dataField) continue;

      if (type && metadata[type]) {
        const alias = metadata[type] as Record<string, number>;
        alias[field] = dataField;
      } else metadata[field] = dataField;
    }

    return !Array.isArray(metadata) ? ([metadata] as ParserData) : (metadata as ParserData);
  }

  private async regTicket(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    const { ticket = {} } = (actionParam as Record<string, string | number>) || {};

    if (_.isEmpty(ticket)) return null;

    const ticketRequiredValues: Array<string> = [
      'name',
      'lastName',
      'address',
      'phone',
      'email',
      'cause',
      'date',
    ];
    const ticketKeys: Array<string> = Object.keys(ticket);

    const isValid: boolean =
      ticketKeys.every((key: string) => {
        const value: string | number = (ticket as Record<string, string>)[key];

        const isDateRange: boolean = key === 'date' && Array.isArray(value);

        if (typeof value !== 'string' && typeof ticket !== 'number' && !isDateRange) {
          return false;
        }
        return true;
      }) && ticketRequiredValues.every((key: string) => (ticket as Record<string, string>)[key]);

    if (!isValid) return null;

    const result = await this.getEntity().createEntity(model, generateRemoteTask(ticket as TicketRemote));
    return result;
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
      case 'reg_crossOrigin_ticket':
        return this.regTicket(model, actionParam);
      default: {
        if (typeAction.includes('update_')) {
          return this.update(actionParam, model, typeAction);
        }
        return null;
      }
    }
  }
}

export default ActionTasks;
