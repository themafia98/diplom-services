import { Response, Request } from 'express';
import url from 'url';
import querystring from 'querystring';
import {
  Params,
  Controller as ControllerApi,
  Actions,
  ActionParams,
} from '../../utils/Interfaces/Interfaces.global';
import { ResRequest, FileBody } from '../../utils/Types/types.global';
import Action from '../../models/Action';
import Decorators from '../../utils/decorators';
import { isValidObjectId, Types } from 'mongoose';
import { createParams } from '../Controllers.utils';

namespace Cabinet {
  const { Controller, Post, Get } = Decorators;

  @Controller('/cabinet')
  export class CabinetController implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/:uid/loadAvatar', private: true, file: true })
    protected async loadAvatar(req: Request, res: Response): ResRequest {
      const params: Params = createParams('update_avatar', 'OK', 'users');
      const files: Array<FileBody> = req.files as Array<FileBody>;
      const { uid = '' } = req.params;

      const image: FileBody = files[0];

      if (!image || !image.buffer) {
        throw new Error('Bad avatar');
      }

      const dataUrl = image.buffer.toString('base64');

      const updateAvatarAction = new Action.ActionParser({
        actionPath: 'users',
        actionType: 'update_single',
      });

      const body: ActionParams = { queryParams: { uid }, updateItem: { avatar: dataUrl } };
      const responseExec: Function = await updateAvatarAction.actionsRunner(body);
      return responseExec(req, res, params);
    }

    @Get({ path: '/findUser', private: true })
    protected async findUser(req: Request, res: Response): ResRequest {
      const params: Params = createParams('get_all', 'done', 'users');
      const actionUser: Actions = new Action.ActionParser({
        actionPath: 'users',
        actionType: 'get_all',
      });

      const { query } = url.parse(req.url);
      const { uid = '' } = querystring.parse(query as string);

      const findQuery: ActionParams =
        uid && isValidObjectId(uid) && typeof uid === 'string' ? { _id: Types.ObjectId(uid) } : { _id: '' };

      const responseExec: Function = await actionUser.actionsRunner(findQuery);
      return responseExec(req, res, params, true);
    }
  }
}

export default Cabinet;
