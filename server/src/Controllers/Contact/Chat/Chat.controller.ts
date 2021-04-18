import { ResRequest } from '../../../Utils/Types/types.global';
import { Request, Response } from 'express';
import { Post, Delete, Put, Controller } from '../../../Utils/decorators/Decorators';
import { Runner } from '../../../Utils/Interfaces/Interfaces.global';
import { CHAT_ROUTE } from './Chat.path';
import { getVersion } from '../../../Utils/utils.global';
import ActionRunner from '../../../Models/ActionRunner/ActionRunner';

@Controller('/chat')
class ChatController {
  static version = getVersion();
  @Post({ path: CHAT_ROUTE[ChatController.version].LOAD_DATA, private: true })
  @Delete({ path: CHAT_ROUTE[ChatController.version].LEAVE_FROM_ROOM, private: true })
  @Post({ path: CHAT_ROUTE[ChatController.version].LOAD_CHATS, private: true })
  @Put({ path: CHAT_ROUTE[ChatController.version].CREATE_ROOM, private: true })
  protected async handleChatRequests(req: Request, res: Response): ResRequest {
    const { actionPath = '', actionType = '', params = {}, moduleName = '' } = req.body;
    const { options = {} } = params;

    const actionCreateRoom: Runner = new ActionRunner({ actionPath, actionType });

    const responseExec: Function = await actionCreateRoom.start({ ...options, moduleName });
    return responseExec(req, res, { moduleName });
  }
}

export default ChatController;
