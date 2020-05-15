import { ActionProps, ActionParams, Actions, Action } from '../../Utils/Interfaces';
import { Model, Document, Types, FilterQuery } from 'mongoose';
import _ from 'lodash';
import ActionEntity from './ActionEntity';
import Utils from '../../Utils';
import { ParserData, limiter, OptionsUpdate, Filter, DeleteEntitiyParams } from '../../Utils/Types';

/** Actions */
import ActionLogger from './ActionsEntity/ActionLogger';
import ActionNotification from './ActionsEntity/ActionNotification';
import ActionNews from './ActionsEntity/ActionNews';
import ActionJournal from './ActionsEntity/ActionJurnal';
import ActionUsers from './ActionsEntity/ActionUsers';
import ActionChatMessage from './ActionsEntity/ActionChatMessage';
import ActionChatRoom from './ActionsEntity/ActionChatRoom';
import ActionGlobal from './ActionsEntity/ActionGlobal';
import ActionTasks from './ActionsEntity/ActionTasks';
import ActionWiki from './ActionsEntity/ActionWiki';
import ActionSettings from './ActionsEntity/ActionSettings';

namespace Action {
  const { getModelByName } = Utils;
  export class ActionParser extends ActionEntity implements Actions {
    constructor(props: ActionProps) {
      super(props);
    }

    public async getCounter(
      model: Model<Document>,
      query: FilterQuery<any>,
      options: object,
    ): Promise<number> {
      return await model.collection.countDocuments(query, options);
    }

    public async getAll(
      model: Model<Document>,
      actionParam: ActionParams,
      limit: limiter,
      skip: number = 0,
      sortType: string = 'desc',
    ): Promise<ParserData> {
      try {
        const toSkip: number = Math.abs(skip);
        const { in: inn = [], where = '' } = actionParam;
        if (inn && where) {
          const { and = [{}], filter = {} } = actionParam as Record<string, Filter | Array<object>>;
          const orCondition: Array<object> = (<Filter>filter)['$or'] || ([{}] as object[]);
          const andComdition: Array<object> = <Array<Filter>>and;
          return await model
            .find()
            .or(orCondition)
            .skip(toSkip)
            .where(where)
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

    public async getFilterData(model: Model<Document>, filter: object, sort?: string): Promise<ParserData> {
      if (!model || !filter) return null;
      const query: FilterQuery<object> = filter;
      return await model.find(query).sort({
        createdAt: sort ? sort : 'desc',
      });
    }

    public async findOnce(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
      try {
        const actionData = await model.findOne(actionParam);
        return actionData;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async createEntity(model: Model<Document>, item: object): Promise<ParserData> {
      try {
        const actionData: Document = await model.create(item);
        return actionData;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async deleteEntity(model: Model<Document>, query: ActionParams): Promise<ParserData> {
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
          else {
            return await model.deleteMany({ [<string>findBy]: { $in: ids } });
          }
        };

        if (isPull) {
          const findByParam = { [<string>findBy]: findBy };
          const queryUpdate = {
            [<string>mode]: { [<string>updateField]: [uid] },
          };

          actionData = await model.update(findByParam, queryUpdate);
          doc = await model.findOne({ [<string>findBy]: findBy });

          if (!doc) {
            return null;
          }

          const record: ArrayLike<string> = doc.get(updateField);

          if (Array.isArray(record) && (!record.length || record.length === 0)) {
            const docResult: { ok: boolean } = await runDelete({ [<string>findBy]: findBy }, multiple);

            if (docResult.ok) {
              return docResult;
            } else return null;
          }

          return actionData;
        } else {
          const docResult: object = await runDelete({}, multiple);

          if ((<Record<string, boolean>>docResult).ok) {
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
    ): Promise<ParserData> {
      try {
        const { queryType = 'single', actionParam = null /** params for multiple update */ } = query;

        switch (queryType) {
          case 'many': {
            const { query = {} } = (actionParam as Record<string, object>) || {};
            const { ids = [], updateProps = {}, returnType = 'default' } = query as DeleteEntitiyParams;
            const parsedIds = ids.map((id: string) => Types.ObjectId(<string>id));

            const actionData: object = await model.updateMany(
              { _id: { $in: parsedIds } },
              { $set: { ...updateProps } },
              { multi: true, ...options },
            );
            const { ok = 0, nModified = 0 } = <Record<string, number>>actionData || {};

            if (returnType === 'arrayItems') {
              return await model.find({ _id: { $in: ids } });
            } else return { status: Boolean(ok), count: nModified };
          }
          default: {
            const { _id: id, key } = query as Record<string, string>;
            const { customQuery, updateProps: upProps = {} } = query;
            const { [<string>customQuery]: customQueryValue = '' } = query;
            const updateProps: object = _.isPlainObject(upProps)
              ? <object>upProps
              : { updateProps: query.updateProps };

            const _id: any = id ? Types.ObjectId(id) : null;

            const findQuery: object =
              _id && !customQuery
                ? { _id }
                : key
                ? { key }
                : customQuery
                ? { [<string>customQuery]: customQueryValue }
                : {};

            const actionData: Document = await model.updateOne(
              findQuery,
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

    public async runSyncClient(actionParam: ActionParams): Promise<ParserData> {
      const { syncList = [] } = actionParam as Record<string, Array<object>>;

      for await (let syncItem of syncList) {
        const { entity = '' } = syncItem as Record<string, string>;
        const { items = [] } = syncItem as Record<string, Array<object>>;
        const model: Model<Document> | null = getModelByName(entity, entity === 'tasks' ? 'task' : entity);

        if (!model) continue;
        for await (let updateProps of items) {
          const copy: { _id: string } = { ...updateProps } as { _id: string };
          const { _id = null, key = '' } = (updateProps as Record<string, string>) || {};
          const validId: any = typeof _id === 'string' ? Types.ObjectId(_id) : null;
          if (!validId) delete copy._id;

          await this.updateEntity(
            model,
            {
              updateProps: copy,
              _id: validId,
              key,
            },
            { upsert: true },
          );
        }
      }

      return [{ syncDone: true }];
    }

    public async getActionData(this: Actions, actionParam: ActionParams = {}): Promise<ParserData> {
      try {
        console.log(`Run action. actionType: ${this.getActionType()},
                            actionPath: ${this.getActionPath()}`);

        if (this.getActionType() === 'sync') {
          return await this.runSyncClient(actionParam);
        }

        switch (this.getActionPath()) {
          case 'global': {
            const action: Action = new ActionGlobal(this);
            return action.run(actionParam);
          }

          case 'notification': {
            const action: Action = new ActionNotification(this);
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
            const action: Action = new ActionJournal(this);
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

          case 'settings': {
            const action: Action = new ActionSettings(this);
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
