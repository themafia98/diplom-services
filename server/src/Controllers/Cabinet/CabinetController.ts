import { NextFunction, Response, Request } from 'express';

import { App, Params, Controller as ControllerApi } from '../../Utils/Interfaces';
import { ResRequest, FileBody } from '../../Utils/Types';

import Responser from '../../Models/Responser';
import Action from '../../Models/Action';
import Decorators from '../../Decorators';

namespace Cabinet {
  const { Controller, Post } = Decorators;

  @Controller('/cabinet')
  export class CabinetController implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/:uid/loadAvatar', private: true, file: true })
    protected async loadAvatar(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
      const params: Params = {
        methodQuery: 'update_avatar',
        from: 'users',
        done: true,
        status: 'OK',
      };
      try {
        const files: Array<FileBody> = req.files as Array<FileBody>;
        const { uid = '' } = req.params;

        const image: FileBody = files[0];

        if (!image || !image.buffer) {
          throw new Error('Bad avatar');
        }

        const dataUrl = image.buffer.toString('base64');

        if (!dataUrl) {
          throw new Error('Bad convert to base64');
        }

        const connect = await dbm.connection().catch((err: Error) => console.error(err));
        if (!connect) throw new Error('Bad connect');

        const updateAvatarAction = new Action.ActionParser({
          actionPath: 'users',
          actionType: 'update_single',
        });

        const body = { queryParams: { uid }, updateItem: { avatar: dataUrl } };
        await updateAvatarAction.getActionData(body);

        return new Responser(res, req, params, null, 200, dataUrl, dbm).emit();
      } catch (err) {
        console.error(err);
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }
  }
}

export default Cabinet;
