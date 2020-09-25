import { Request, Response } from 'express';
import _ from 'lodash';
import { Params, ActionParams, BodyLogin } from '../../Utils/Interfaces';
import { ResRequest } from '../../Utils/Types';
import Action from '../../Models/Action';
import Decorators from '../../Decorators';
import { ACTIONS_ACCESS } from '../../app.constant';

namespace Tasks {
  const Controller = Decorators.Controller;
  const Get = Decorators.Get;
  const Post = Decorators.Post;
  const Put = Decorators.Put;

  @Controller('/tasks')
  export class TasksController {
    @Post({ path: '/list', private: true })
    @Get({ path: '/list', private: true })
    protected async getList(req: Request, res: Response): ResRequest {
      const params: Params = {
        methodQuery: 'get_all',
        status: 'done',
        done: true,
        from: 'tasks',
      };

      const {
        params: { limitList = null, keys = null, saveData = {}, filterCounter = null, options = {} } = {},
      } = req.body || {};
      const { itemId = '' } = options;

      const queryParams: Record<string, any> = {};

      if (keys) queryParams.keys = keys;
      else if (itemId) queryParams.keys = [itemId];

      const actionParams: ActionParams = {
        queryParams,
        limitList,
        saveData,
        filterCounter,
      };

      const actionTasks = new Action.ActionParser({ actionPath: 'tasks', actionType: 'get_all' });
      const responseExec: Function = await actionTasks.actionsRunner(actionParams);
      return responseExec(req, res, params, true);
    }

    @Post({ path: '/listCounter', private: true })
    @Get({ path: '/listCounter', private: true })
    protected async getListCounter(req: Request, res: Response): ResRequest {
      const { params: { filterCounter = null, saveData = {} } = {} } = req.body || {};
      const params: Params = {
        methodQuery: 'list_counter',
        status: 'done',
        done: true,
        from: 'tasks',
      };
      const listCounterAction = new Action.ActionParser({
        actionPath: 'tasks',
        actionType: 'list_counter',
      });

      const responseExec: Function = await listCounterAction.actionsRunner(
        !filterCounter ? { saveData } : { filterCounter, saveData },
      );
      return responseExec(req, res, params);
    }

    @Post({ path: '/createTask', private: true })
    protected async create(req: Request, res: Response): ResRequest {
      const { params: task = {} } = req.body;
      const params: Params = {
        methodQuery: 'set_single',
        status: 'done',
        done: true,
        from: 'users',
      };

      const shouldBeCreate = (req as any).session.availableActions.some(
        (it: string) => it === ACTIONS_ACCESS.CREATE,
      );

      const createTaskAction = new Action.ActionParser({
        actionPath: 'tasks',
        actionType: 'set_single',
      });

      const responseExec: Function = await createTaskAction.actionsRunner(shouldBeCreate ? task : null);
      return responseExec(req, res, params);
    }

    @Put({ path: '/caching/jurnal', private: true })
    protected async setJurnalWorks(req: Request, res: Response): ResRequest {
      const params: Params = {
        methodQuery: 'set_jurnal',
        status: 'done',
        done: true,
        from: 'jurnalworks',
      };

      const { params: jurnalEntity = {} } = req.body;
      const body: BodyLogin = jurnalEntity;

      const createJurnalAction = new Action.ActionParser({
        actionPath: 'jurnalworks',
        actionType: 'set_jurnal',
        body,
      });

      const responseExec: Function = await createJurnalAction.actionsRunner(body);
      return responseExec(req, res, params);
    }

    @Put({ path: '/caching/list', private: true })
    protected async getCachingList(req: Request, res: Response): ResRequest {
      const { params: { options = {} } = {}, actionType = '' } = req.body;
      const params: Params = {
        methodQuery: actionType,
        status: 'done',
        done: true,
        from: 'tasks',
      };
      const { store = '' } = options || {};

      const actionTasks = new Action.ActionParser({ actionPath: store, actionType: actionType });

      const responseExec: Function = await actionTasks.actionsRunner(options);
      return responseExec(req, res, params);
    }

    /** Hard-code for tests */
    @Put({ path: '/regTicket', private: false, file: true })
    protected async regTicket(req: Request, res: Response): ResRequest {
      const body = { ticket: req.body, actionType: 'reg_crossOrigin_ticket' };
      const params: Params = {
        methodQuery: body.actionType,
        status: 'done',
        done: true,
        from: 'tasks',
      };
      const actionTasks = new Action.ActionParser({ actionPath: 'tasks', actionType: body.actionType });

      const responseExec: Function = await actionTasks.actionsRunner(body);
      return responseExec(req, res, params);
    }
  }
}

export default Tasks;
