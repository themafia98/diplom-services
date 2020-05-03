import { ActionProps, ActionParams, Actions, Action } from '../../Utils/Interfaces';
import { Model, Document, Types, FilterQuery } from 'mongoose';
import _ from 'lodash';
import ActionEntity from './ActionEntity';
import { ParserData, limiter, OptionsUpdate, Filter, DeleteEntitiyParams } from '../../Utils/Types';

/** Actions */
import ActionLogger from './ActionsEntity/ActionLogger';
import ActionNotification from './ActionsEntity/ActionNotification';
import ActionNews from './ActionsEntity/ActionNews';
import ActionJurnal from './ActionsEntity/ActionJurnal';
import ActionUsers from './ActionsEntity/ActionUsers';
import ActionChatMessage from './ActionsEntity/ActionChatMessage';
import ActionChatRoom from './ActionsEntity/ActionChatRoom';
import ActionGlobal from './ActionsEntity/ActionGlobal';
import ActionTasks from './ActionsEntity/ActionTasks';
import ActionWiki from './ActionsEntity/ActionWiki';

namespace Action {
  export class ActionParser extends ActionEntity implements Actions {
    constructor(props: ActionProps) {
      super(props);
    }

    public async getCounter(model: Model<Document>, query: FilterQuery<any>): Promise<number> {
      return await model.collection.countDocuments(query);
    }

    public async getAll(
      model: Model<Document>,
      actionParam: ActionParams,
      limit: limiter,
      skip: number = 0,
      sortType: string = 'desc',
    ): ParserData {
      try {
        const toSkip: number = Math.abs(skip);
        const { in: inn, where = '' } = actionParam;
        if (inn && where) {
          const { and = [{}], filter = {} } = actionParam as Record<string, Filter | Array<object>>;
          const orCondition: Array<object> = (<Filter>filter)['$or'] as object[];
          const andComdition: Array<object> = <Array<Filter>>and;
          return await model
            .find()
            .or(orCondition)
            .skip(toSkip)
            .where(actionParam.where)
            .and(andComdition)
            .in(<any>inn)
            .limit(<number>limit)
            .sort({
              createdAt: sortType,
            });
        }

        const actionData: Array<Document> = await model
          .find(actionParam)
          .limit(<number>limit)
          .skip(toSkip)
          .sort({
            createdAt: sortType,
          });

        return actionData;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async getFilterData(model: Model<Document>, filter: object, sort?: string): ParserData {
      if (!model || !filter) return null;
      const query: FilterQuery<object> = filter;
      return await model.find(query).sort({
        createdAt: sort ? sort : 'desc',
      });
    }

    public async findOnce(model: Model<Document>, actionParam: ActionParams): ParserData {
      try {
        const actionData = await model.findOne(actionParam);
        return actionData;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async createEntity(model: Model<Document>, item: object): ParserData {
      try {
        const actionData: Document = await model.create(item);
        return actionData;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async deleteEntity(model: Model<Document>, query: ActionParams): ParserData {
      try {
        const { multiple = false, mode = '$pullAll', findBy, queryParams = {} } = query;
        const { uid = '', updateField = '', ids = [] } = ({} = <DeleteEntitiyParams>queryParams || {});

        const isPull = mode === '$pullAll';
        let actionData: Document | null = null;
        let doc: Document | null = null;

        const runDelete: Function = async (
          props: ActionParams,
          multiple: boolean = false,
        ): Promise<object> => {
          if (!multiple) return await model.deleteOne(props);
          else return await model.deleteMany({ [<string>findBy]: { $in: ids } });
        };

        if (isPull) {
          const findByParam = { [<string>findBy]: findBy };
          const queryUpdate = { [<string>mode]: { [<string>updateField]: [uid] } };

          actionData = await model.update(findByParam, queryUpdate);
          doc = await model.findOne({ [<string>findBy]: findBy });

          if (!doc) {
            return null;
          }

          const record: ArrayLike<string> = doc.get(updateField);

          if (Array.isArray(record) && (!record?.length || record?.length === 0)) {
            const docResult: { ok: boolean } = await runDelete({ [<string>findBy]: findBy }, multiple);

            if (docResult?.ok) {
              return docResult;
            } else return null;
          }

          return actionData;
        } else {
          const docResult: object = await runDelete({}, multiple);

          if ((<Record<string, boolean>>docResult)?.ok) {
            return <Document>docResult;
          } else return null;
        }
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async updateEntity(
      model: Model<Document>,
      query: ActionParams,
      options: OptionsUpdate = {},
    ): ParserData {
      try {
        const { queryType = 'single', actionParam = null /** params for multiple update */ } = query;

        switch (queryType) {
          case 'many': {
            const { query = {} } = (actionParam as Record<string, object>) || {};
            const { ids = [], updateProps = {}, returnType = 'default' } = query as DeleteEntitiyParams;
            const parsedIds = ids.map((id: string) => Types.ObjectId(id));

            const actionData: object = await model.updateMany(
              { _id: { $in: parsedIds } },
              { $set: { ...updateProps } },
              { multi: true, ...options },
            );
            const { ok = 0, nModified = 0 } = <Record<string, number>>actionData || {};

            if (returnType === 'arrayItems') return await model.find({ _id: { $in: ids } });
            else return { status: Boolean(ok), count: nModified };
          }
          default: {
            const { _id, updateProps: upProps = {} } = query;
            const updateProps: object = _.isPlainObject(upProps)
              ? <object>upProps
              : { updateProps: query.updateProps };

            const actionData: Document = await model.updateOne(
              _id ? { _id } : {},
              {
                ...updateProps,
              },
              options,
            );
            return actionData;
          }
        }
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async getActionData(actionParam: ActionParams = {}): ParserData {
      try {
        console.log(`Run action. actionType: ${this.getActionType()}, 
                            actionPath: ${this.getActionPath()}`);

        switch (this.getActionPath()) {
          case 'global': {
            const action = new ActionGlobal(this);
            return action.run(actionParam);
          }

          case 'notification': {
            const action = new ActionNotification(this);
            return action.run(actionParam);
          }

          case 'chatRoom': {
            const action: Action = new ActionChatRoom(this);
            return action.run(actionParam);
          }

          case 'chatMsg': {
            const action: Action = new ActionChatMessage(this);
            return action.run(actionParam);
          }

          case 'users': {
            const action: Action = new ActionUsers(this);
            return action.run(actionParam);
          }

          case 'jurnalworks': {
            const action: Action = new ActionJurnal(this);
            return action.run(actionParam);
          }

          case 'tasks': {
            const action: Action = new ActionTasks(this);
            return action.run(actionParam);
          }

          case 'news': {
            const action: Action = new ActionNews(this);
            return action.run(actionParam);
          }

          case 'settingsLog': {
            const action: Action = new ActionLogger(this);
            return action.run(actionParam);
          }

          case 'wiki': {
            const action: Action = new ActionWiki(this);
            return action.run(actionParam);
          }

          default: {
            return null;
          }
        }
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  }
}

export default Action;
