import { Request, Response } from 'express';
import { Controller, Post, Put, Get } from '../../Utils/decorators/Decorators';
import {
  Params,
  ActionParams,
  BodyLogin,
  QueryParams,
  RequestWithParams,
} from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';
import { createParams } from '../Controllers.utils';
import { TASKS_ROUTE } from './Tasks.path';
import { getVersion } from '../../Utils/utils.global';
import ActionRunner from '../../Models/ActionRunner/ActionRunner';
import { ENTITY } from '../../Models/Database/Schema/Schema.constant';

@Controller('/tasks')
class TasksController {
  static version = getVersion();

  @Post({ path: TASKS_ROUTE[TasksController.version].LOAD_TASKS_LIST, private: true })
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

    const actionTasks = new ActionRunner({ actionPath: 'tasks', actionType: 'get_all' });
    const responseExec = await actionTasks.start(actionParams);
    return responseExec(req, res, params, true);
  }

  @Post({ path: TASKS_ROUTE[TasksController.version].LOAD_COUNTER, private: true })
  @Get({ path: TASKS_ROUTE[TasksController.version].LOAD_COUNTER, private: true })
  protected async getListCounter(req: Request, res: Response): ResRequest {
    const { params: { filterCounter = null, saveData = {} } = {} } = req.body;

    const params: Params = createParams('list_counter', 'done', 'tasks');

    const listCounterAction = new ActionRunner({
      actionPath: 'tasks',
      actionType: 'list_counter',
    });

    const responseExec = await listCounterAction.start(
      !filterCounter ? { saveData } : { filterCounter, saveData },
    );
    return responseExec(req, res, params);
  }

  @Post({ path: TASKS_ROUTE[TasksController.version].CREATE_TASK, private: true })
  protected async create(req: Request, res: Response): ResRequest {
    const { params: task = {} } = req.body;

    const params: Params = createParams('set_single', 'done', ENTITY.USERS);
    const { shouldBeCreate = false } = req as RequestWithParams;

    if (!shouldBeCreate) {
      params.customErrorMessage = 'Access error for create task';
    }

    const createTaskAction = new ActionRunner({
      actionPath: 'tasks',
      actionType: 'set_single',
    });

    const responseExec = await createTaskAction.start(shouldBeCreate ? task : null);
    return responseExec(req, res, params);
  }

  @Put({ path: TASKS_ROUTE[TasksController.version].CACHING_JURNAL, private: true })
  protected async setJurnalWorks(req: Request, res: Response): ResRequest {
    const params: Params = createParams('set_jurnal', 'done', ENTITY.TASK_LOGS);
    const { params: jurnalEntity = {} } = req.body;

    const body: BodyLogin = jurnalEntity;

    const createJurnalAction = new ActionRunner({
      actionPath: ENTITY.TASK_LOGS,
      actionType: 'set_jurnal',
      body,
    });

    const responseExec = await createJurnalAction.start(body);
    return responseExec(req, res, params);
  }

  @Put({ path: TASKS_ROUTE[TasksController.version].LOAD_JURNAL_LIST, private: true })
  protected async getCachingList(req: Request, res: Response): ResRequest {
    const { params: { options = {} } = {}, actionType = '' } = req.body;

    const params: Params = createParams(actionType, 'done', 'tasks');

    const { store = '' } = options || {};

    const actionTasks = new ActionRunner({ actionPath: store, actionType });

    const responseExec = await actionTasks.start(options);
    return responseExec(req, res, params);
  }

  /** Hard-code for tests */
  @Put({ path: '/regTicket', private: false, file: true })
  protected async regTicket(req: Request, res: Response): ResRequest {
    const body = { ticket: req.body, actionType: 'reg_crossOrigin_ticket' };
    const params: Params = createParams(body.actionType, 'done', 'tasks');

    const actionTasks = new ActionRunner({ actionPath: 'tasks', actionType: body.actionType });

    const responseExec = await actionTasks.start(body);
    return responseExec(req, res, params);
  }
}

export default TasksController;
