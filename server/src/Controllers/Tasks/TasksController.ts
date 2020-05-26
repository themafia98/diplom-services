import { Request, Response } from 'express';
import _ from 'lodash';
import Utils from '../../Utils';
import { Params, ActionParams, BodyLogin } from '../../Utils/Interfaces';
import { ResRequest, ParserResult, Meta } from '../../Utils/Types';
import Responser from '../../Models/Responser';
import Action from '../../Models/Action';
import Decorators from '../../Decorators';

namespace Tasks {
  const { parsePublicData } = Utils;
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
      try {
        const { options: { limitList = null, keys = null, saveData = {}, filterCounter = null } = {} } =
          req.body || {};
        const actionParams: ActionParams = {
          queryParams: keys ? { keys } : {},
          limitList,
          saveData,
          filterCounter,
        };

        const actionTasks = new Action.ActionParser({ actionPath: 'tasks', actionType: 'get_all' });
        const data: ParserResult = await actionTasks.getActionData(actionParams);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        let metadata: Meta = [];

        if (data && Array.isArray(data)) {
          metadata = parsePublicData(data);
        }

        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Post({ path: '/listCounter', private: true })
    @Get({ path: '/listCounter', private: true })
    protected async getListCounter(req: Request, res: Response): ResRequest {
      const { filterCounter = null, saveData = {} } = req.body || {}; // uid

      const params: Params = {
        methodQuery: 'list_counter',
        status: 'done',
        done: true,
        from: 'tasks',
      };
      try {
        const listCounterAction = new Action.ActionParser({
          actionPath: 'tasks',
          actionType: 'list_counter',
        });

        const data: ParserResult = await listCounterAction.getActionData(
          !filterCounter ? { saveData } : { filterCounter, saveData },
        );

        if (!data && !_.isNumber(data)) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, 0).emit();
        }

        return new Responser(res, req, params, null, 200, data).emit();
      } catch (err) {
        console.log(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Post({ path: '/createTask', private: true })
    protected async create(req: Request, res: Response): ResRequest {
      const body: BodyLogin = req.body;
      const params: Params = {
        methodQuery: 'set_single',
        status: 'done',
        done: true,
        from: 'users',
      };
      try {
        if (!body || _.isEmpty(body)) {
          params.done = false;
          params.status = 'FAIL BODY';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const createTaskAction = new Action.ActionParser({
          actionPath: 'tasks',
          actionType: 'set_single',
        });

        const data: ParserResult = await createTaskAction.getActionData(req.body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const meta: Meta = parsePublicData([data] as ParserResult);
        const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.log(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Put({ path: '/caching/jurnal', private: true })
    protected async setJurnalWorks(req: Request, res: Response): ResRequest {
      const params: Params = {
        methodQuery: 'set_jurnal',
        status: 'done',
        done: true,
        from: 'jurnalworks',
      };
      try {
        if (!req.body || _.isEmpty(req.body)) {
          params.done = false;
          params.status = 'FAIL BODY';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const body: object = req.body;

        const createJurnalAction = new Action.ActionParser({
          actionPath: 'jurnalworks',
          actionType: 'set_jurnal',
          body,
        });

        const data: ParserResult = await createJurnalAction.getActionData(req.body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const meta: Meta = parsePublicData([data] as ParserResult);
        const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.log(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Put({ path: '/caching/list', private: true })
    protected async getCachingList(req: Request, res: Response): ResRequest {
      const { queryParams = {}, actionType = '' } = req.body;
      const params: Params = {
        methodQuery: actionType,
        status: 'done',
        done: true,
        from: 'tasks',
      };
      try {
        const { store = '' } = queryParams || {};

        const actionTasks = new Action.ActionParser({ actionPath: store, actionType: actionType });
        const data: ParserResult = await actionTasks.getActionData(queryParams);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        let metadata: Meta = [];
        if (data && Array.isArray(data)) {
          metadata = parsePublicData(data);
        }

        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Put({ path: '/regTicket', private: false, file: true })
    protected async regTicket(req: Request, res: Response): ResRequest {
      const body = { ticket: req.body, actionType: 'reg_crossOrigin_ticket' };
      const params: Params = {
        methodQuery: body.actionType,
        status: 'done',
        done: true,
        from: 'tasks',
      };
      try {
        const actionTasks = new Action.ActionParser({ actionPath: 'tasks', actionType: body.actionType });
        const data: ParserResult = await actionTasks.getActionData(body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        return new Responser(res, req, params, null, 200, []).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }
  }
}

export default Tasks;
