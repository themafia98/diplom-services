import { NextFunction, Response, Request } from 'express';
import _ from 'lodash';
import { Document } from 'mongoose';
import { App, Params, FileApi, ActionParams } from '../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../Utils/Types';
import Utils from '../../Utils';
import Decorators from '../../Decorators';
import Action from '../../Models/Action';

namespace Wiki {
  const { getResponseJson } = Utils;
  const Controller = Decorators.Controller;
  const Delete = Decorators.Delete;
  const Put = Decorators.Put;
  const Get = Decorators.Get;

  @Controller('/wiki')
  export class WikiController {
    @Get({ path: '/list', private: true })
    async getTreeList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'wiki' };
      try {
        const service = server.locals;
        const connect = await service.dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

        const actionTreeList = new Action.ActionParser({
          actionPath: 'wiki',
          actionType: 'get_all',
        });
        const data: ParserResult = await actionTreeList.getActionData({});

        await service.dbm.disconnect().catch((err: Error) => console.error(err));

        if (!data) {
          params.status = 'error';
          params.done = false;
          res.status(404);
          return res.json(
            getResponseJson(
              'error',
              { status: 'FAIL', params, done: false, metadata: data },
              (req as Record<string, any>).start,
            ),
          );
        }

        return res.json(
          getResponseJson(
            'done',
            { status: 'OK', done: true, params, metadata: data },
            (req as Record<string, any>).start,
          ),
        );
      } catch (err) {
        console.error(err);
        await server.locals.service.dbm.disconnect().catch((err: Error) => console.error(err));

        if (!res.headersSent) {
          params.done = false;
          params.status = 'FAIL';
          res.status(503);
          return res.json(
            getResponseJson(
              err.name,
              { status: 'Server error', done: false, params, metadata: null },
              (req as Record<string, any>).start,
            ),
          );
        }
      }
    }

    @Put({ path: '/createLeaf', private: true })
    async createLeaf(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const params: Params = { methodQuery: 'create_leaf', status: 'done', done: true, from: 'wiki' };
      try {
        const service = server.locals;
        const body: ActionParams = req.body;
        const connect = await service.dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

        const actionCreateLeaf = new Action.ActionParser({
          actionPath: 'wiki',
          actionType: 'create_leaf',
        });

        const data: ParserResult = await actionCreateLeaf.getActionData(body);

        await service.dbm.disconnect().catch((err: Error) => console.error(err));

        const { user: { rules = '' } = {} } = <Record<string, Record<string, string>>>body;
        const metadata: ArrayLike<object> = Utils.parsePublicData(data, 'accessGroups', rules);

        if (!data) {
          params.status = 'error';
          params.done = false;
          res.status(404);
          return res.json(
            getResponseJson(
              'error',
              { status: 'FAIL', params, done: false, metadata },
              (req as Record<string, any>).start,
            ),
          );
        }

        return res.json(
          getResponseJson(
            'done',
            { status: 'OK', done: true, params, metadata },
            (req as Record<string, any>).start,
          ),
        );
      } catch (err) {
        console.error(err);
        await server.locals.service.dbm.disconnect().catch((err: Error) => console.error(err));

        if (!res.headersSent) {
          params.done = false;
          params.status = 'FAIL';
          res.status(503);
          return res.json(
            getResponseJson(
              err.name,
              { status: 'Server error', done: false, params, metadata: null },
              (req as Record<string, any>).start,
            ),
          );
        }
      }
    }
  }
}

export default Document;
