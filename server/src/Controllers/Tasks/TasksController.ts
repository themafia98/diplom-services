import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import Utils from '../../Utils';
import { App, Params, ActionParams } from '../../Utils/Interfaces';
import { ResRequest, ParserResult } from '../../Utils/Types';
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
    public async getList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'tasks' };
      try {
        const connect = await dbm.connection().catch((err: Error) => {
          console.error(err);
        });

        const { options: { limitList = null, keys = null, saveData = {}, filterCounter = null } = {} } =
          req?.body || {};
        const actionParams: ActionParams = {
          queryParams: keys ? { keys } : {},
          limitList,
          saveData,
          filterCounter,
        };

        if (!connect) throw new Error('Bad connect');

        const actionTasks = new Action.ActionParser({ actionPath: 'tasks', actionType: 'get_all' });
        const data: ParserResult = await actionTasks.getActionData(actionParams);
        const isPartData: boolean = Boolean(keys);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        let metadata: ArrayLike<object> = [];

        if (data && Array.isArray(data)) {
          metadata = parsePublicData(data);
        }
        (<Record<string, any>>params).isPartData = isPartData;
        return new Responser(res, req, params, null, 200, metadata, dbm).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Post({ path: '/listCounter', private: true })
    @Get({ path: '/listCounter', private: true })
    public async getListCounter(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { filterCounter = null, saveData = {} } = req?.body || {}; // uid
      const { dbm } = server.locals;
      const params: Params = {
        methodQuery: 'list_counter',
        status: 'done',
        done: true,
        from: 'tasks',
      };
      try {
        const connect = await dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

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
          return new Responser(res, req, params, null, 404, 0, dbm).emit();
        }

        return new Responser(res, req, params, null, 200, data, dbm).emit();
      } catch (err) {
        console.log(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Post({ path: '/createTask', private: true })
    public async create(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
      const params: Params = {
        methodQuery: 'set_single',
        status: 'done',
        done: true,
        from: 'users',
      };
      try {
        if (!req.body || _.isEmpty(req.body)) {
          params.done = false;
          params.status = 'FAIL BODY';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const param: object = req.body.param;
        const connect = await dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

        const createTaskAction = new Action.ActionParser({
          actionPath: 'tasks',
          actionType: 'set_single',
        });

        const data: ParserResult = await createTaskAction.getActionData(req.body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const meta: ArrayLike<object> = parsePublicData(<ParserResult>[data]);
        const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

        return new Responser(res, req, params, null, 200, metadata, dbm).emit();
      } catch (err) {
        console.log(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Put({ path: '/caching/jurnal', private: true })
    public async setJurnalWorks(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
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
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const body: object = req.body;
        const connect = await dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

        const createJurnalAction = new Action.ActionParser({
          actionPath: 'jurnalworks',
          actionType: 'set_jurnal',
          body,
        });

        const data: ParserResult = await createJurnalAction.getActionData(req.body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const meta: ArrayLike<object> = parsePublicData(<ParserResult>[data]);
        const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

        return new Responser(res, req, params, null, 200, metadata, dbm).emit();
      } catch (err) {
        console.log(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Put({ path: '/caching/list', private: true })
    public async getCachingList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
      const { queryParams = {}, actionType = '' } = req.body;
      const params: Params = { methodQuery: actionType, status: 'done', done: true, from: 'tasks' };
      try {
        const connect = await dbm.connection().catch((err: Error) => {
          console.error(err);
        });

        const { store = '' } = queryParams || {};

        if (!connect) throw new Error('Bad connect');

        const actionTasks = new Action.ActionParser({ actionPath: store, actionType: actionType });
        const data: ParserResult = await actionTasks.getActionData(queryParams);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        let metadata: ArrayLike<object> = [];
        if (data && Array.isArray(data)) {
          metadata = parsePublicData(data);
        }

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

export default Tasks;
