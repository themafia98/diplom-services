import { NextFunction, Response, Request } from 'express';
import _ from 'lodash';
import { App, Params, ActionParams } from '../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../Utils/Types';

import Utils from '../../Utils';
import Action from '../../Models/Action';
import Decorators from '../../Decorators';

namespace Cabinet {
  const { getResponseJson, isImage } = Utils;
  const { Controller, Post } = Decorators;

  @Controller('/cabinet')
  export class CabinetController {
    @Post({ path: '/:uid/loadAvatar', private: true, file: true })
    public async loadAvatar(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { files = [] } = req;
      const { uid = '' } = req.params;

      const image = (<Record<string, any>>files)[0] || null;

      if (!image || !image?.buffer) {
        throw new Error('Bad avatar');
      }

      const dataUrl = image.buffer.toString('base64');

      if (!dataUrl) {
        throw new Error('Bad convert to base64');
      }

      const params: Params = {
        methodQuery: 'update_avatar',
        from: 'users',
        done: true,
        status: 'OK',
      };

      try {
        const dbm = server.locals.dbm;
        const connect = await dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

        const updateAvatarAction = new Action.ActionParser({
          actionPath: 'users',
          actionType: 'update_single',
        });

        const body = { queryParams: { uid }, updateItem: { avatar: dataUrl } };

        const data: ParserResult = await updateAvatarAction.getActionData(body);

        await dbm.disconnect().catch((err: Error) => console.error(err));

        res.status(200);
        return res.json(
          getResponseJson(
            'update_avatar',
            { params, metadata: dataUrl, done: true, status: 'OK' },
            (<Record<string, any>>req).start,
          ),
        );
      } catch (error) {
        console.error(error);
        if (!res.headersSent) {
          res.status(503);
          return res.json(
            getResponseJson(
              'Server error',
              { params, status: 'FAIL', done: false, metadata: [] },
              (<Record<string, any>>req).start,
            ),
          );
        }
      }
    }
  }
}

export default Cabinet;
