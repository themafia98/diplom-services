import { Response, Request } from 'express';
import { Params, Controller as ControllerApi } from '../../Utils/Interfaces';
import { ResRequest, FileBody } from '../../Utils/Types';
import Action from '../../Models/Action';
import Decorators from '../../Decorators';

namespace Cabinet {
  const { Controller, Post } = Decorators;

  @Controller('/cabinet')
  export class CabinetController implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/:uid/loadAvatar', private: true, file: true })
    protected async loadAvatar(req: Request, res: Response): ResRequest {
      const params: Params = {
        methodQuery: 'update_avatar',
        from: 'users',
        done: true,
        status: 'OK',
      };
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

      const body = { queryParams: { uid }, updateItem: { avatar: dataUrl } };
      const responseExec: Function = await updateAvatarAction.actionsRunner(body);
      return responseExec(req, res, params);
    }
  }
}

export default Cabinet;
