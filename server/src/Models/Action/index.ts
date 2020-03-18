import { ActionProps, ActionParams, Actions } from '../../Utils/Interfaces';
import { Model, Document } from 'mongoose';
import _ from 'lodash';
import ActionEntity from './ActionEntity';
import { ParserData } from '../../Utils/Types';

/** Actions */
import ActionLogger from './ActionsEntity/ActionLogger';
import ActionNotification from "./ActionsEntity/ActionNotification";
import ActionNews from './ActionsEntity/ActionNews';
import ActionJurnal from './ActionsEntity/ActionJurnal';
import ActionUsers from './ActionsEntity/ActionUsers';
import ActionChatMessage from './ActionsEntity/ActionChatMessage';
import ActionChatRoom from './ActionsEntity/ActionChatRoom';
import ActionGlobal from './ActionsEntity/ActionGlobal';
import ActionTasks from './ActionsEntity/ActionTasks';

namespace Action {
  export class ActionParser extends ActionEntity implements Actions {
    constructor(props: ActionProps) {
      super(props);
    }

    public async getAll(model: Model<Document>, actionParam: ActionParams) {
      try {
        const actionData: Array<Document> = await model.find(actionParam);
        return actionData;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async findOnce(model: Model<Document>, actionParam: ActionParams) {
      try {
        const actionData = await model.findOne(actionParam);
        return actionData;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async createEntity(model: Model<Document>, item: object) {
      try {
        console.log('create entity:', item);
        const actionData: Document = await model.create(item);
        return actionData;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    public async deleteEntity(model: Model<Document>, query: ActionParams) {
      try {
        const { tokenRoom, uid, updateField } = query;
        const actionData: Document = await model.update(
          { tokenRoom },
          {
            $pullAll: { [<string>updateField]: [uid] },
          },
        );

        const roomDoc: Document | null = await model.findOne({ tokenRoom });

        if (!roomDoc) {
          return null;
        }

        const record: ArrayLike<string> = (roomDoc as Record<string, any>)[<string>updateField];

        if (Array.isArray(record) && (!record.length || record.length === 0)) {
          const roomDocResult: Record<string, any> = await model.deleteOne({ tokenRoom });

          if (roomDocResult.ok) {
            return roomDocResult;
          } else return null;
        }

        return actionData;
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
            const action = new ActionChatRoom(this);
            return action.run(actionParam);
          }

          case 'chatMsg': {
            const action = new ActionChatMessage(this);
            return action.run(actionParam);
          }

          case 'users': {
            const action = new ActionUsers(this);
            return action.run(actionParam);
          }

          case 'jurnalworks': {
            const action = new ActionJurnal(this);
            return action.run(actionParam);
          }

          case 'tasks': {
            const action = new ActionTasks(this);
            return action.run(actionParam);
          }

          case 'news': {
            const action = new ActionNews(this);
            return action.run(actionParam);
          }

          case 'settingsLog': {
            const action = new ActionLogger(this);
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
