import { Model, Document, Types, isValidObjectId } from 'mongoose';
import {
  ActionParams,
  Action,
  TicketRemote,
  QueryParams,
  Parser,
} from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData, Pagination } from '../../../Utils/Types/types.global';
import Utils from '../../../Utils/utils.global';
import _ from 'lodash';
import { ObjectID } from 'mongodb';
import { ACTION_TYPE } from './ActionTasks.constant';
import ActionEntity from '../../ActionEntity/ActionEntity';
import { ENTITY } from '../../Database/Schema/Schema.constant';
const { getModelByName, generateRemoteTask, getFilterQuery, parseFilterFields } = Utils;

class ActionTasks implements Action {
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

  public async createSingleTask(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    try {
      const actionData: ParserData = await this.getEntityParser().createEntity(model, actionParam);
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
      const { options = {}, updateItem = '', updateField = '' } = actionParam as Record<
        string,
        object | string
      >;
      const { id = '' } = (options as Record<string, string>) || {};

      let updateProps = {};
      let actionData: Document | null = null;

      if (typeAction.includes('single') && updateField && updateItem) {
        (updateProps as Record<string, string>)[updateField as string] = updateItem as string;
      } else if (typeAction.includes('many')) {
        updateProps = updateItem;
      }

      const parsedId = Types.ObjectId(id);

      if (!parsedId) throw new Error('bad object id in update task');

      if (!_.isEmpty(updateProps)) await model.updateOne({ _id: parsedId }, updateProps);
      else throw new Error('Bad update props');

      actionData = await model.findById(parsedId);

      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private async getTasks(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = null, limitList = 20, saveData = {}, filterCounter = '' } = actionParam;

    const _id: ObjectID | string =
      filterCounter && isValidObjectId(filterCounter) ? Types.ObjectId(filterCounter as string) : '';

    const {
      paginationState: initialPagination = null,
      pagination: nextPagination = null,
    } = saveData as Record<string, any>;
    const pagination: Pagination = initialPagination ? initialPagination : nextPagination;

    let params: QueryParams = {};
    const isEmpty = actionParam.queryParams && _.isEmpty(actionParam.queryParams);

    if (!(isEmpty || (queryParams && !(<QueryParams>queryParams).keys))) {
      params = queryParams as QueryParams;
    }

    const { keys = [] } = queryParams as Record<string, Array<string>>;

    let parsedKeys: Array<Types.ObjectId | string> = keys;

    if (Array.isArray(keys)) {
      parsedKeys = keys.reduce((keysList: Array<Types.ObjectId>, key: string) => {
        if (key && isValidObjectId(key)) return [...keysList, Types.ObjectId(key)];

        return keysList;
      }, []);
    }

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

    const paramsList: ActionParams = _.isEmpty(params) ? filter : query;

    const isPagerParams = pagination && pagination.current && pagination.pageSize;
    const skip: number = isPagerParams && limitList ? (pagination.current - 1) * pagination.pageSize : 0;
    return this.getEntityParser().getAll(model, paramsList, limitList as number | null, skip);
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

    return await this.getEntityParser().getCounter(model, filter);
  }

  private async getStats(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    const { queryParams = {} } = actionParam as Record<string, QueryParams>;
    const { type = '', todayISO = '', limitList = '', queryType = '' } = actionParam as Record<
      string,
      string
    >;

    const { statsListFields = [] } = queryParams || {};
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
      const dataField: number = await this.getEntityParser().getCounter(
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

    const result = await this.getEntityParser().createEntity(
      model,
      generateRemoteTask(ticket as TicketRemote),
    );
    return result;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('tasks', ENTITY.TASK);
    if (!model) return null;

    const typeAction: string = this.getEntity().getActionType();

    switch (typeAction) {
      case ACTION_TYPE.GET_TASKS:
        return this.getTasks(actionParam, model);
      case ACTION_TYPE.SAVE_TASK:
        return this.createSingleTask(actionParam, model);
      case ACTION_TYPE.TASK_COUNTER:
        return await this.getTaskCount(model, actionParam);
      case ACTION_TYPE.TASK_STATS:
        return await this.getStats(model, actionParam);
      case ACTION_TYPE.REG_TICKET:
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
