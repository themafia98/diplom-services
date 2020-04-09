import { ActionProps, ActionParams, Actions, Action } from '../../Utils/Interfaces';
import { Model, Document } from 'mongoose';
import _ from 'lodash';
import ActionEntity from './ActionEntity';
import { ParserData, limiter } from '../../Utils/Types';

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

    public async getAll(model: Model<Document>, actionParam: ActionParams, limit: limiter): ParserData {
      try {
        if (actionParam.in && actionParam.where) {
          return await model
            .find()
            .where(actionParam.where)
            .in((<Record<string, any[]>>actionParam).in)
            .limit(<number>limit);
        }

        const actionData: Array<Document> = await model.find(actionParam).limit(<number>limit);

        return actionData;
      } catch (err) {
        console.error(err);
        return null;
      }
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
        console.log('create entity:', item);
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
        const { uid = '', updateField = '', ids = [] } = ({} = <Record<string, string>>queryParams || {});

        const isPull = mode === '$pullAll';
        let actionData: Document | null = null;
        let doc: Document | null = null;

        const runDelete: Function = async (
          props: ActionParams,
          multiple: boolean = false,
        ): Promise<Record<string, any>> => {
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

          const record: ArrayLike<string> = (doc as Record<string, any>)[<string>updateField];

          if (Array.isArray(record) && (!record?.length || record?.length === 0)) {
            const docResult: Record<string, any> = await runDelete({ [<string>findBy]: findBy }, multiple);

            if (docResult?.ok) {
              return <Document>docResult;
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

    public async updateEntity(model: Model<Document>, query: ActionParams): ParserData {
      try {
        const { _id } = query;
        const updateProps = <Record<string, any>>query.updateProps;
        const actionData: Document = await model.updateOne(
          { _id },
          {
            ...updateProps,
          },
        );
        return actionData;
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
