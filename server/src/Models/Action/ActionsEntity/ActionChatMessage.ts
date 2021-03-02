import { Model, Document, Types, isValidObjectId } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../utils/Interfaces/Interfaces.global';
import { ParserData, MessageOptions } from '../../../utils/Types/types.global';
import Utils from '../../../utils/utils.global';

const { getModelByName } = Utils;

class ActionChatMessage implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private getMsgByToken(actionParam: ActionParams, model: Model<Document>) {
    const { tokenRoom = '', moduleName = '', membersIds = [] } = actionParam as MessageOptions;

    const ids: Array<Types.ObjectId | string> = membersIds.map((id) => {
      if (isValidObjectId(id)) return Types.ObjectId(id);
      return id;
    });

    if (!tokenRoom || !moduleName) {
      console.error('Bad tokenRoom or moduleName in get_msg_by_token action');
      return null;
    }

    const query: ActionParams = { tokenRoom, moduleName, authorId: { $in: ids } };
    return this.getEntity().getAll(model, query);
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
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
