import { Response, Request } from 'express';
import url from 'url';
import querystring from 'querystring';
import { Params, ActionParams, Runner } from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest, FileBody } from '../../Utils/Types/types.global';
import ActionRunner from '../../Models/ActionRunner/ActionRunner';
import { Controller, Post, Get } from '../../Utils/decorators/Decorators';
import { isValidObjectId, Types } from 'mongoose';
import { createParams } from '../Controllers.utils';
import { CABINET_ROUTE } from './Cabinet.path';
import { ROUTE_PARAMS } from '../../Models/Router/Router.constant';
import { getVersion } from '../../Utils/utils.global';
import { ENTITY } from '../../Models/Database/Schema/Schema.constant';

@Controller('/cabinet')
class CabinetController {
  static version = getVersion();
  @Post({ path: CABINET_ROUTE[CabinetController.version].LOAD_USER, private: true, file: true })
  protected async loadAvatar(req: Request, res: Response): ResRequest {
    const params: Params = createParams('update_avatar', 'done', ENTITY.USERS);
    const files: Array<FileBody> = req.files as Array<FileBody>;
    const { [ROUTE_PARAMS.USER_ID]: uid } = req.params;

    const image: FileBody = files[0];

    if (!image || !image.buffer) {
      throw new Error('Bad avatar');
    }

    const dataUrl = image.buffer.toString('base64');

    const updateAvatarAction: Runner = new ActionRunner({
      actionPath: ENTITY.USERS,
      actionType: 'update_single',
    });

    const body: ActionParams = { queryParams: { uid }, updateItem: { avatar: dataUrl } };
    const responseExec: Function = await updateAvatarAction.start(body);
    return responseExec(req, res, params);
  }

  @Get({ path: CABINET_ROUTE[CabinetController.version].FIND_USER, private: true })
  protected async findUser(req: Request, res: Response): ResRequest {
    const params: Params = createParams('get_all', 'done', ENTITY.USERS);
    const actionUser: Runner = new ActionRunner({
      actionPath: ENTITY.USERS,
      actionType: 'get_all',
    });

    const { query } = url.parse(req.url);
    const { uid = '' } = querystring.parse(query as string);

    const findQuery: ActionParams =
      uid && isValidObjectId(uid) && typeof uid === 'string' ? { _id: Types.ObjectId(uid) } : { _id: '' };

    const responseExec: Function = await actionUser.start(findQuery);
    return responseExec(req, res, params, true);
  }
}

export default CabinetController;
