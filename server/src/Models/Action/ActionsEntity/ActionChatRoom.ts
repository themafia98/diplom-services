import { Model, Document } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import Utils from '../../../Utils';
const { getModelByName, checkEntity } = Utils;

class ActionChatRoom implements Action {
  constructor(private entity: Actions) {}

  getEntity(): Actions {
    return this.entity;
  }

  private async getEntrypointData(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { uid = '', socket = {} } = (actionParam as Record<string, string | object>) || {};

    const { socketConnection = false, module: moduleName = '' } = socket as Record<string, boolean | string>;
    const query: ActionParams = { moduleName, membersIds: { $in: [uid] } };

    if (socketConnection && moduleName) return this.getEntity().getAll(model, query);

    return null;
  }

  private getUpdateRooms(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams: { tokenRoom = '', moduleName = '' } = {} } =
      (actionParam as Record<string, any>) || {};

    const query: ActionParams = { tokenRoom, moduleName };

    return this.getEntity().getAll(model, query);
  }

  private async createRoom(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    if (!actionParam) return null;

    const mode: string = actionParam.type && actionParam.type === 'single' ? 'equalSingle' : 'equal';

    const isValid: boolean = await checkEntity(mode, 'membersIds', actionParam, model);

    if (!isValid) return null;

    const result = await this.getEntity().createEntity(model, {
      ...actionParam,
      tokenRoom: uuid(),
    });
    return result;
  }

  private async leaveRoom(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const uid: string = (actionParam as Record<string, string>).uid;
    const roomToken: string = (actionParam as Record<string, string>).roomToken;
    const updateField: string = (actionParam as Record<string, string>).updateField;

    const query = { findBy: roomToken, uid, updateField };
    const actionData: ParserData = await this.getEntity().deleteEntity(model, query);
    return actionData as Document | null;
  }

  private async roomGenerator(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const modelMsg: Model<Document> | null = getModelByName('chatMsg', 'chatMsg');
    const msg: Record<string, any> = (actionParam as Record<string, any>).fakeMsg || {};
    const interlocutorId: string = (actionParam as Record<string, string>).interlocutorId;

    const isEmptyMsg = !msg || !msg.authorId || !msg.tokenRoom;

    if (!modelMsg || isEmptyMsg || !interlocutorId || !msg.moduleName) {
      return null;
    }

    const room = {
      type: 'single',
      moduleName: msg.moduleName,
      tokenRoom: msg.tokenRoom,
      membersIds: [msg.authorId, interlocutorId],
      groupName: msg.groupName ? msg.groupName : null,
    };

    const actionData: ParserData = await this.getEntity().createEntity(model, room);

    if (!actionData) return null;

    const saveMsg = await modelMsg.create(msg);

    if (!saveMsg) return null;

    return actionData;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('chatRoom', 'chatRoom');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'entrypoint_chat':
        return this.getEntrypointData(actionParam, model);
      case 'get_update_rooms':
        return this.getUpdateRooms(actionParam, model);
      case 'create_chatRoom':
        return this.createRoom(actionParam, model);
      case 'leave_room':
        return this.leaveRoom(actionParam, model);
      case 'create_FakeRoom':
        return this.roomGenerator(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionChatRoom;
