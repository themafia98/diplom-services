import { Request, Response, NextFunction } from 'express';
import _ from 'lodash';
import Utils from '../../Utils';
import { App, Params, ResponseDocument } from '../../Utils/Interfaces';
import { ResRequest, docResponse, ParserResult } from '../../Utils/Types';

import Action from '../../Models/Action';
import Decorators from '../../Decorators';

namespace Tasks {
  const { getResponseJson } = Utils;
  const Controller = Decorators.Controller;
  const Get = Decorators.Get;
  const Post = Decorators.Post;

  @Controller('/tasks')
  export class TasksController {
    @Get({ path: '/list', private: true })
    public async getList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'tasks' };
      try {
        const service = server.locals;
        const connect = await service.dbm.connection().catch((err: Error) => {
          console.error(err);
        });

        if (!connect) throw new Error('Bad connect');

        const actionTasks = new Action.ActionParser({ actionPath: 'tasks', actionType: 'get_all' });
        const data: ParserResult = await actionTasks.getActionData({});

        if (!data) {
          params.status = 'error';

          return res.json(
            getResponseJson(
              'error',
              { params, metadata: data, status: 'FAIL', done: false },
              (req as Record<string, any>).start,
            ),
          );
        }

        await service.dbm.disconnect().catch((err: Error) => console.error(err));

        let metadata: ArrayLike<object> = [];

        if (data && Array.isArray(data)) {
          metadata = data
            .map((it: docResponse) => {
              const item: ResponseDocument = it['_doc'] || it;

              return Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
                if (!key.includes('password') && !key.includes('At') && !key.includes('__v')) {
                  obj[key] = item[key];
                }
                return obj;
              }, {});
            })
            .filter(Boolean);
        }

        return res.json(
          getResponseJson(
            'done',
            { params, metadata, done: true, status: 'OK' },
            (req as Record<string, any>).start,
          ),
        );
      } catch (err) {
        console.error(err);
        if (!res.headersSent) {
          return res.json(
            getResponseJson(
              err.name,
              { metadata: 'Server error', params, done: false, status: 'FAIL' },
              (req as Record<string, any>).start,
            ),
          );
        }
      }
    }

    @Post({ path: '/createTask', private: true })
    public async create(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const params: Params = {
        methodQuery: 'set_single',
        status: 'done',
        done: true,
        from: 'users',
      };
      try {
        const dbm = server.locals.dbm;

        if (req.body && !_.isEmpty(req.body)) {
          const param: object = req.body.param;

          const connect = await dbm.connection().catch((err: Error) => console.error(err));

          if (!connect) throw new Error('Bad connect');

          const createTaskAction = new Action.ActionParser({
            actionPath: 'tasks',
            actionType: 'set_single',
          });

          const data: ParserResult = await createTaskAction.getActionData(req.body);

          await dbm.disconnect().catch((err: Error) => console.error(err));

          if (!data) {
            params.status = 'error';

            return res.json(
              getResponseJson(
                'error set_single task',
                { status: 'FAIL', params, done: false, metadata: data },
                (req as Record<string, any>).start,
              ),
            );
          }

          const meta = <ArrayLike<object>>Utils.parsePublicData(<ParserResult>[data]);

          const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

          return res.json(
            getResponseJson(
              'done',
              { status: 'OK', done: true, params, metadata },
              (req as Record<string, any>).start,
            ),
          );
        } else if (!res.headersSent) {
          return res.json(
            getResponseJson(
              'error',
              {
                status: 'FAIL',
                params: { body: req.body, ...params },
                done: false,
                metadata: 'Body empty',
              },
              (req as Record<string, any>).start,
            ),
          );
        }
      } catch (err) {
        console.log(err.message);
        if (!res.headersSent) {
          return res.json(
            getResponseJson(
              err.name,
              { status: 'FAIL', params, done: false, metadata: 'Server error' },
              (req as Record<string, any>).start,
            ),
          );
        }
      }
    }

    @Post({ path: '/caching/jurnal', private: true })
    public async setJurnalWorks(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const params: Params = {
        methodQuery: 'set_jurnal',
        status: 'done',
        done: true,
        from: 'jurnalworks',
      };
      try {
        const dbm = server.locals.dbm;

        if (req.body && !_.isEmpty(req.body)) {
          const body: object = req.body;
          const connect = await dbm.connection().catch((err: Error) => console.error(err));

          if (!connect) throw new Error('Bad connect');

          const createJurnalAction = new Action.ActionParser({
            actionPath: 'jurnalworks',
            actionType: 'set_jurnal',
            body,
          });

          const data: ParserResult = await createJurnalAction.getActionData(req.body);
          await dbm.disconnect().catch((err: Error) => console.error(err));

          if (!data) {
            params.status = 'error';
            params.done = false;

            return res.json(
              getResponseJson(
                'error set_jurnal action',
                { status: 'FAIL', params, done: false, metadata: data },
                (req as Record<string, any>).start,
              ),
            );
          }

          const meta = <ArrayLike<object>>Utils.parsePublicData(<ParserResult>[data]);
          const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

          return res.json(
            getResponseJson(
              'done',
              { status: 'OK', done: true, params, metadata },
              (req as Record<string, any>).start,
            ),
          );
        } else if (!res.headersSent) {
          return res.json(
            getResponseJson(
              'error',
              { status: 'FAIL', params, done: false, metadata: null },
              (req as Record<string, any>).start,
            ),
          );
        }
      } catch (err) {
        console.log(err.message);
        if (!res.headersSent) {
          return res.json(
            getResponseJson(
              err.name,
              { status: 'FAIL', params, done: false, metadata: 'Server error' },
              (req as Record<string, any>).start,
            ),
          );
        }
      }
    }

    @Post({ path: '/caching/list', private: true })
    public async getCachingList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { queryParams = {}, actionType = '' } = req.body;
      const params: Params = { methodQuery: actionType, status: 'done', done: true, from: 'tasks' };
      try {
        const service = server.locals;
        const connect = await service.dbm.connection().catch((err: Error) => {
          console.error(err);
        });

        const { store = '' } = queryParams || {};

        if (!connect) throw new Error('Bad connect');

        const actionTasks = new Action.ActionParser({ actionPath: store, actionType: actionType });
        const data: ParserResult = await actionTasks.getActionData(queryParams);

        if (!data) {
          params.status = 'error';

          return res.json(
            getResponseJson(
              'error',
              { params, status: 'FAIL', done: false, metadata: data },
              (req as Record<string, any>).start,
            ),
          );
        }

        await service.dbm.disconnect().catch((err: Error) => console.error(err));

        let metadata: Array<docResponse> = [];

        if (data && Array.isArray(data)) {
          metadata = data
            .map((it: docResponse) => {
              const item: ResponseDocument = it['_doc'] || it;

              return Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
                if (!key.includes('password') && !key.includes('At') && !key.includes('__v')) {
                  obj[key] = item[key];
                }
                return obj;
              }, {});
            })
            .filter(Boolean);
        }

        return res.json(
          getResponseJson(
            'done',
            { params, metadata, status: 'OK', done: true },
            (req as Record<string, any>).start,
          ),
        );
      } catch (err) {
        params.done = false;
        console.error(err);
        if (!res.headersSent) {
          return res.json(
            getResponseJson(
              err.name,
              { metadata: 'Server error', status: 'FAIL', done: false, params },
              (req as Record<string, any>).start,
            ),
          );
        }
      }
    }
  }
}

export default Tasks;
