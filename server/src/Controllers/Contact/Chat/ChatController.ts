import _ from 'lodash';
import Responser from '../../../Models/Responser';
import { App } from '../../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../../Utils/Types';
import { NextFunction, Request, Response } from 'express';

import Decorators from '../../../Decorators';
import Utils from '../../../Utils';
import Action from '../../../Models/Action';

namespace Chat {
  const Post = Decorators.Post;
  const Delete = Decorators.Delete;
  const Put = Decorators.Put;
  const Controller = Decorators.Controller;
  const { getResponseJson, parsePublicData } = Utils;

  export const createRealRoom = async (
    fakeMsg: Record<string, any>,
    interlocutorId: string,
  ): Promise<ParserResult> => {
    const actionPath: string = 'chatRoom';
    const actionType: string = 'create_FakeRoom';

    const actionCreateRoom = new Action.ActionParser({ actionPath, actionType });
    const queryParams = { fakeMsg, interlocutorId };
    const data: ParserResult = await actionCreateRoom.getActionData(queryParams);
    console.log('CreateRealRoom', data);

    return data;
  };

  @Controller('/chat')
  export class ChatController {
    @Post({ path: '/loadChats', private: true })
    public async loadChats(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { body: { actionPath = '', actionType = '', queryParams: params = {} } = {} } = req;

      try {
        if (!actionPath || !actionType) {
          throw new Error('Invalid action chat');
        }

        const actionLoadChats = new Action.ActionParser({ actionPath, actionType });
        const data: ParserResult = await actionLoadChats.getActionData(params);

        if (!data) throw new TypeError('Bad action data');

        const filterData: ArrayLike<object> = parsePublicData(data);

        return new Responser(res, req, params, null, 200, filterData).emit();
      } catch (err) {
        console.error(err);
        if (!res.headersSent) res.sendStatus(503);
      }
    }

    @Put({ path: '/createRoom', private: true })
    public async createRoom(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { body: { actionPath = '', actionType = '', queryParams: params = {} } = {} } = req;

      try {
        if (!actionPath || !actionType) {
          throw new Error('Invalid action chat');
        }

        const actionCreateRoom = new Action.ActionParser({ actionPath, actionType });
        const data: ParserResult = await actionCreateRoom.getActionData(params);

        if (!data) throw new TypeError('Bad action data');

        return new Responser(res, req, params, null, 200, data).emit();
      } catch (err) {
        console.error(err);
        if (!res.headersSent) res.sendStatus(503);
      }
    }

    @Delete({ path: '/leaveRoom', private: true })
    async leaveRoom(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { body: { queryParams: params = {} } = {} } = req;
      const actionType: string = 'chatRoom';
      const actionPath: string = 'leave_room';
      try {
        if (!actionPath || !actionType) {
          throw new Error('Invalid action chat');
        }

        const leaveRoomAction = new Action.ActionParser({ actionPath, actionType });

        const data: ParserResult = await leaveRoomAction.getActionData(params);

        if (!data) {
          throw new TypeError('Bad action data');
        }

        return new Responser(res, req, params, null, 200, data).emit();
      } catch (err) {
        console.error(err);
        if (!res.headersSent) res.sendStatus(503);
      }
    }

    @Post({ path: '/load/tokenData', private: true })
    async loadTokenData(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const {
        body: {
          queryParams: params = {},
          options: { actionPath: aPath = '', actionType: aType = '' } = {},
        } = {},
      } = req;
      const actionType: string = aType ? aType : 'get_msg_by_token';
      const actionPath: string = aPath ? aPath : 'chatMsg';
      try {
        if (!actionPath || !actionType) throw new Error('Invalid action chat');

        const actionCreateRoom = new Action.ActionParser({ actionPath, actionType });
        const data: ParserResult = await actionCreateRoom.getActionData(params);

        if (!data) throw new TypeError('Bad action data');

        return new Responser(res, req, params, null, 200, data).emit();
      } catch (err) {
        console.error(err);
        if (!res.headersSent) res.sendStatus(503);
      }
    }
  }
}

export default Chat;
