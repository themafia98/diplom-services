import { Request, Response } from 'express';
import _ from 'lodash';
import { Params, ActionParams, BodyLogin, QueryParams } from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';
import Action from '../../Models/Action';
import Decorators from '../../Utils/decorators';
import { createParams } from '../Controllers.utils';
import { TASKS_ROUTE } from './Tasks.path';

namespace Tasks {
  const Controller = Decorators.Controller;
  const Get = Decorators.Get;
  const Post = Decorators.Post;
  const Put = Decorators.Put;

  @Controller('/tasks')
  export class TasksController {
    @Post({ path: TASKS_ROUTE[process.env.API_VERSION].LOAD_TASKS_LIST, private: true })
    @Get({ path: '/list', private: true })
    protected async getList(req: Request, res: Response): ResRequest {
      const params: Params = createParams('get_all', 'done', 'tasks');

      const {
        params: { limitList = null, keys = null, saveData = {}, filterCounter = null, options = {} } = {},
      } = req.body;
      const { itemId = '' } = options;

      const queryParams: QueryParams = {};

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

    @Post({ path: TASKS_ROUTE[process.env.API_VERSION].LOAD_COUNTER, private: true })
    @Get({ path: TASKS_ROUTE[process.env.API_VERSION].LOAD_COUNTER, private: true })
    protected async getListCounter(req: Request, res: Response): ResRequest {
      const { params: { filterCounter = null, saveData = {} } = {} } = req.body;

      const params: Params = createParams('list_counter', 'done', 'tasks');

      const listCounterAction = new Action.ActionParser({
        actionPath: 'tasks',
        actionType: 'list_counter',
      });

      const responseExec: Function = await listCounterAction.actionsRunner(
        !filterCounter ? { saveData } : { filterCounter, saveData },
      );
      return responseExec(req, res, params);
    }

    @Post({ path: TASKS_ROUTE[process.env.API_VERSION].CREATE_TASK, private: true })
    protected async create(req: Request, res: Response): ResRequest {
      const { params: task = {} } = req.body;

      const params: Params = createParams('set_single', 'done', 'users');
      const { shouldBeCreate = false } = req as Record<string, any>;

      if (!shouldBeCreate) {
        params.customErrorMessage = 'Access error for create task';
      }

      const createTaskAction = new Action.ActionParser({
        actionPath: 'tasks',
        actionType: 'set_single',
      });

      const responseExec: Function = await createTaskAction.actionsRunner(shouldBeCreate ? task : null);
      return responseExec(req, res, params);
    }

    @Put({ path: TASKS_ROUTE[process.env.API_VERSION].CACHING_JURNAL, private: true })
    protected async setJurnalWorks(req: Request, res: Response): ResRequest {
      const params: Params = createParams('set_jurnal', 'done', 'jurnalworks');
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

    @Put({ path: TASKS_ROUTE[process.env.API_VERSION].LOAD_JURNAL_LIST, private: true })
    protected async getCachingList(req: Request, res: Response): ResRequest {
      const { params: { options = {} } = {}, actionType = '' } = req.body;

      const params: Params = createParams(actionType, 'done', 'tasks');

      const { store = '' } = options || {};

      const actionTasks = new Action.ActionParser({ actionPath: store, actionType: actionType });

      const responseExec: Function = await actionTasks.actionsRunner(options);
      return responseExec(req, res, params);
    }

    /** Hard-code for tests */
    @Put({ path: '/regTicket', private: false, file: true })
    protected async regTicket(req: Request, res: Response): ResRequest {
      const body = { ticket: req.body, actionType: 'reg_crossOrigin_ticket' };
      const params: Params = createParams(body.actionType, 'done', 'tasks');

      const actionTasks = new Action.ActionParser({ actionPath: 'tasks', actionType: body.actionType });

      const responseExec: Function = await actionTasks.actionsRunner(body);
      return responseExec(req, res, params);
    }
  }
}

export default Tasks;
