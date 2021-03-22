import { Model, Document, Types, isValidObjectId } from 'mongoose';
import { ActionParams, Action, Parser } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData, MessageOptions } from '../../../Utils/Types/types.global';
import Utils from '../../../Utils/utils.global';
import ActionEntity from '../../ActionEntity/ActionEntity';
import { ACTION_TYPE } from './ActionChatMessage.constant';

const { getModelByName } = Utils;

class ActionChatMessage implements Action {
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
    return this.getEntityParser().getAll(model, query);
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('chatMsg', 'chatMsg');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case ACTION_TYPE.GET_MSG_BY_TOKEN:
        return this.getMsgByToken(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionChatMessage;
