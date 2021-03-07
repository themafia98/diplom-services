import { Response, Request } from 'express';
import _ from 'lodash';
import { Params, Controller as ControllerApi } from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';
import Decorators from '../../Utils/decorators';
import Action from '../../Models/Action';
import { createParams } from '../Controllers.utils';
import { STATISTIC_ROUTE } from './Statistic.path';
import Utils from '../../Utils/utils.global';

namespace Statistic {
  const Controller = Decorators.Controller;
  const Post = Decorators.Post;

  @Controller('/statistic')
  export class StatisticController implements ControllerApi<FunctionConstructor> {
    @Post({ path: STATISTIC_ROUTE[Utils.getVersion()].LOAD_TASK_BAR, private: true })
    protected async getTaskBarStats(req: Request, res: Response): ResRequest {
      const params: Params = createParams('get_stats', 'done', 'tasks');
      const { params: { options = {} } = {} } = req.body;

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
