import { ParserResult, ResRequest } from '../../../Utils/Types';
import { Request, Response } from 'express';

import Decorators from '../../../Decorators';
import Action from '../../../Models/Action';
import { Controller as ControllerApi } from '../../../Utils/Interfaces';

namespace Chat {
  const Post = Decorators.Post;
  const Delete = Decorators.Delete;
  const Put = Decorators.Put;
  const Controller = Decorators.Controller;

  export const createRealRoom = async (
    fakeMsg: Record<string, string | object>,
    interlocutorId: string,
  ): Promise<ParserResult> => {
    const actionPath: string = 'chatRoom';
    const actionType: string = 'create_FakeRoom';

    const actionCreateRoom = new Action.ActionParser({ actionPath, actionType });
    const queryParams = { fakeMsg, interlocutorId };
    const data: ParserResult = await actionCreateRoom.actionsRunner(queryParams);

    return data;
  };

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
}

export default Chat;
