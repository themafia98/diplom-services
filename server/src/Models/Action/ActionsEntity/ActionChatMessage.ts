import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import Utils from '../../../Utils';
import _ from 'lodash';
const { getModelByName } = Utils;

class ActionChatMessage implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private getMsgByToken(actionParam: ActionParams, model: Model<Document>) {
    const { options: { tokenRoom = '', moduleName = '', membersIds = [] } = {} } = <Record<string, any>>(
      actionParam
    );

    if (!tokenRoom || !moduleName) {
      console.error('Bad tokenRoom or moduleName in get_msg_by_token action');
      return null;
    }

    const query: ActionParams = { tokenRoom, moduleName, authorId: { $in: membersIds } };
    return this.getEntity().getAll(model, query);
  }

  public async run(actionParam: ActionParams): ParserData {
    const model: Model<Document> | null = getModelByName('chatMsg', 'chatMsg');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'get_msg_by_token':
        return this.getMsgByToken(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionChatMessage;
