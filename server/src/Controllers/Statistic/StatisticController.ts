import { Response, Request } from 'express';
import _ from 'lodash';
import { Params, Controller as ControllerApi } from '../../Utils/Interfaces';
import { ResRequest } from '../../Utils/Types';
import Decorators from '../../Decorators';
import Action from '../../Models/Action';

namespace Statistic {
  const Controller = Decorators.Controller;
  const Post = Decorators.Post;

  @Controller('/statistic')
  export class StatisticController implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/taskBar', private: true })
    protected async getTaskBarStats(req: Request, res: Response): ResRequest {
      const params: Params = { methodQuery: 'get_stats', status: 'done', done: true, from: 'tasks' };

      const { options = {} } = req.body || {};

      const actionStats = new Action.ActionParser({
        actionPath: 'tasks',
        actionType: 'get_stats',
      });

      const body = { ...options, type: 'bar' };

      const responseExec: Function = await actionStats.actionsRunner(body);
      return responseExec(req, res, params);
    }
  }
}

export default Statistic;
