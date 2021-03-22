import { Model, Document, Types, isValidObjectId } from 'mongoose';
import { v4 as uuid } from 'uuid';
import { ActionParams, Action, SocketMessageDoc, Parser } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData, SocketMeta } from '../../../Utils/Types/types.global';
import Utils from '../../../Utils/utils.global';
import ActionEntity from '../../ActionEntity/ActionEntity';
import { ACTION_TYPE } from './ActionChatRoom.constant';
const { getModelByName, checkEntity } = Utils;

class ActionChatRoom implements Action {
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
  private async getEntrypointData(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { uid: uidDirty = '', socket = {} } = actionParam;
    const uid: Types.ObjectId | null = isValidObjectId(uidDirty as string)
      ? Types.ObjectId(uidDirty as string)
      : null;

    if (!uid) return null;

    const { socketConnection = false, module: moduleName = '' } = socket as Record<string, SocketMeta>;
    const query: ActionParams = { moduleName, membersIds: { $in: [uid] } };

    if (socketConnection && moduleName) return this.getEntityParser().getAll(model, query);

    return null;
  }

  private getUpdateRooms(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { tokenRoom = '', moduleName = '' } = actionParam as Record<string, SocketMeta>;

    const query: ActionParams = { tokenRoom, moduleName };

    return this.getEntityParser().getAll(model, query);
  }

  private async createRoom(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    if (!actionParam) return null;
    const { type = 'single' } = actionParam;

    const mode: string = type === 'single' ? 'equalSingle' : 'equal';

    const isValid: boolean = await checkEntity(mode, 'membersIds', actionParam, model);

    if (!isValid) return null;

    const result = await this.getEntityParser().createEntity(model, {
      ...actionParam,
      tokenRoom: uuid(),
    });
    return result;
  }

  private async leaveRoom(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { uid = '', roomToken = '', updateField = '' } = actionParam as Record<string, SocketMeta>;
    const query = { findBy: roomToken, uid, updateField };
    const actionData: ParserData = await this.getEntityParser().deleteEntity(model, query);
    return actionData as Document | null;
  }

  private async roomGenerator(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const modelMsg: Model<Document> | null = getModelByName('chatMsg', 'chatMsg');
    const { fakeMsg: msg } = actionParam as Record<string, SocketMessageDoc>;
    const { interlocutorId: interlocutorIdDirty = '' } = actionParam as Record<string, string>;
    const { authorId: authorIdDirty = '', moduleName = '', tokenRoom = '', groupName = '' } = msg;

    const interlocutorId: Types.ObjectId | null = isValidObjectId(interlocutorIdDirty)
      ? Types.ObjectId(interlocutorIdDirty)
      : null;

    const authorId: Types.ObjectId | null = isValidObjectId(authorIdDirty)
      ? Types.ObjectId(authorIdDirty)
      : null;

    const isEmptyMsg = !msg || !authorId || !tokenRoom;

    if (!modelMsg || isEmptyMsg || !interlocutorId || !moduleName) {
      return null;
    }

    const room = {
      type: 'single',
      moduleName: moduleName,
      tokenRoom: tokenRoom,
      membersIds: [authorId, interlocutorId],
      groupName: groupName ? groupName : null,
    };

    const actionData: ParserData = await this.getEntityParser().createEntity(model, room);

    if (!actionData) return null;

    const saveMsg = await modelMsg.create(msg);

    if (!saveMsg) return null;

    return actionData;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('chatRoom', 'chatRoom');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case ACTION_TYPE.ENTRYPOINT:
        return this.getEntrypointData(actionParam, model);
      case ACTION_TYPE.GET_UPDATE_ROOMS:
        return this.getUpdateRooms(actionParam, model);
      case ACTION_TYPE.CREATE_ROOM:
        return this.createRoom(actionParam, model);
      case ACTION_TYPE.LEAVE_ROOM:
        return this.leaveRoom(actionParam, model);
      case ACTION_TYPE.CREATE_FAKE_ROOM:
        return this.roomGenerator(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionChatRoom;
