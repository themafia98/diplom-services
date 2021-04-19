import { Response, Request } from 'express';
import { Params } from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';
import { Controller, Post } from '../../Utils/decorators/Decorators';
import { createParams } from '../Controllers.utils';
import { STATISTIC_ROUTE } from './Statistic.path';
import { getVersion } from '../../Utils/utils.global';
import ActionRunner from '../../Models/ActionRunner/ActionRunner';

@Controller('/statistic')
class StatisticController {
  static version = getVersion();

  @Post({ path: STATISTIC_ROUTE[StatisticController.version].LOAD_TASK_BAR, private: true })
  protected async getTaskBarStats(req: Request, res: Response): ResRequest {
    const params: Params = createParams('get_stats', 'done', 'tasks');
    const { params: { options = {} } = {} } = req.body;

    const actionStats = new ActionRunner({
      actionPath: 'tasks',
      actionType: 'get_stats',
    });

    const body = { ...options, type: 'bar' };

    const responseExec = await actionStats.start(body);
    return responseExec(req, res, params);
  }
}

export default StatisticController;
