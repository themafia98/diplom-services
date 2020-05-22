import { NextFunction, Response, Request } from 'express';
import _ from 'lodash';
import { App, Params, Controller as ControllerApi } from '../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../Utils/Types';

import Responser from '../../Models/Responser';
import Decorators from '../../Decorators';
import Action from '../../Models/Action';

namespace Statistic {
  const Controller = Decorators.Controller;
  const Post = Decorators.Post;

  @Controller('/statistic')
  export class StatisticController implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/taskBar', private: true })
    protected async getTaskBarStats(
      req: Request,
      res: Response,
      next: NextFunction,
      server: App,
    ): ResRequest {
      const { dbm } = server.locals;
      const params: Params = { methodQuery: 'get_stats', status: 'done', done: true, from: 'tasks' };
      try {
        const { options = {} } = req.body || {};
        const connect = await dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

        const actionStats = new Action.ActionParser({
          actionPath: 'tasks',
          actionType: 'get_stats',
        });

        const data: ParserResult = await actionStats.getActionData({ ...options, type: 'bar' });

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }
        const parsedMetadata: Array<object> = _.isArray(data)
          ? (data as Array<object>)
          : ([data] as Array<object>);
        const metadata: Array<object> = parsedMetadata.reverse();

        return new Responser(res, req, params, null, 200, metadata, dbm).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }
  }
}

export default Statistic;
