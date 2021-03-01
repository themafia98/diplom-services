import { ResRequest } from '../../../Utils/Types';
import { Request, Response } from 'express';

import Decorators from '../../../Decorators';
import Action from '../../../Models/Action';
import { Controller as ControllerApi } from '../../../Utils/Interfaces';

const Post = Decorators.Post;
const Delete = Decorators.Delete;
const Put = Decorators.Put;
const Controller = Decorators.Controller;

@Controller('/chat')
export class ChatController implements ControllerApi<FunctionConstructor> {
  @Post({ path: '/load/tokenData', private: true })
  @Delete({ path: '/leaveRoom', private: true })
  @Post({ path: '/loadChats', private: true })
  @Put({ path: '/createRoom', private: true })
  protected async getRooms(req: Request, res: Response): ResRequest {
    const { actionPath = '', actionType = '', params = {}, moduleName = '' } = req.body;
    const { options = {} } = params;

    const actionCreateRoom = new Action.ActionParser({ actionPath, actionType });

    const responseExec: Function = await actionCreateRoom.actionsRunner({ ...options, moduleName });
    return responseExec(req, res, { moduleName });
  }
}

export default ChatController;
