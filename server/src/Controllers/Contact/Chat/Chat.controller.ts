import { ResRequest } from '../../../Utils/Types/types.global';
import { Request, Response } from 'express';

import Decorators from '../../../Utils/decorators';
import Action from '../../../Models/Action';
import { Controller as ControllerApi } from '../../../Utils/Interfaces/Interfaces.global';
import { CHAT_ROUTE } from './Chat.path';
import Utils from '../../../Utils/utils.global';

const Post = Decorators.Post;
const Delete = Decorators.Delete;
const Put = Decorators.Put;
const Controller = Decorators.Controller;

@Controller('/chat')
export class ChatController implements ControllerApi<FunctionConstructor> {
  @Post({ path: CHAT_ROUTE[Utils.getVersion()].LOAD_DATA, private: true })
  @Delete({ path: CHAT_ROUTE[Utils.getVersion()].LEAVE_FROM_ROOM, private: true })
  @Post({ path: CHAT_ROUTE[Utils.getVersion()].LOAD_CHATS, private: true })
  @Put({ path: CHAT_ROUTE[Utils.getVersion()].CREATE_ROOM, private: true })
  protected async handleChatRequests(req: Request, res: Response): ResRequest {
    const { actionPath = '', actionType = '', params = {}, moduleName = '' } = req.body;
    const { options = {} } = params;

    const actionCreateRoom = new Action.ActionParser({ actionPath, actionType });

    const responseExec: Function = await actionCreateRoom.actionsRunner({ ...options, moduleName });
    return responseExec(req, res, { moduleName });
  }
}

export default ChatController;
