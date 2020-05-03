import { NextFunction, Response, Request } from 'express';
import Responser from '../../../Models/Responser';
import { App, Params, ActionParams, Controller, BodyLogin } from '../../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../../Utils/Types';

import Decorators from '../../../Decorators';
import Action from '../../../Models/Action';

namespace News {
  const Controller = Decorators.Controller;
  const Post = Decorators.Post;
  const Get = Decorators.Get;

  @Controller('/news')
  export class NewsController implements Controller<FunctionConstructor> {
    @Post({ path: '/createNews', private: true })
    protected async createNews(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const service = server.locals;
      const { dbm } = service;
      try {
        const bodyRequest: BodyLogin = req.body;
        const connect = await dbm.connection().catch((err: Error) => {
          console.error(err);
        });

        const { queryParams = {} } = bodyRequest;
        const { actionType = '' } = queryParams as Record<string, string>;
        const body: ActionParams = bodyRequest.metadata as ActionParams;

        if (!connect) throw new Error('Bad connect');

        const params: Params = {
          methodQuery: actionType,
          status: 'done',
          done: true,
          from: 'news',
        };

        const actionNews = new Action.ActionParser({ actionPath: 'news', actionType });
        const data: Readonly<ParserResult> = await actionNews.getActionData(body);

        if (!data) {
          params.status = 'error';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        return new Responser(res, req, params, null, 200, data, dbm).emit();
      } catch (err) {
        console.error(err);
        const bodyRequest: BodyLogin = req.body;
        const { queryParams = {} } = bodyRequest;
        const { actionType = '' } = queryParams as Record<string, string>;

        const params: Params = {
          methodQuery: actionType,
          status: 'done',
          done: true,
          from: 'news',
        };
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Post({ path: '/list', private: true })
    @Get({ path: '/list', private: true })
    protected async getNewsList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      let data: Readonly<ParserResult>;
      const service = server.locals;
      const { dbm } = service;
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'news' };
      try {
        const connect = await dbm.connection().catch((err: Error) => {
          console.error(err);
        });

        if (!connect) throw new Error('Bad connect');

        const { options: { limitList = null, keys = null } = {} } = req?.body || {};
        const actionParams: ActionParams = { queryParams: keys ? { keys } : {}, limitList };

        const actionNews = new Action.ActionParser({ actionPath: 'news', actionType: 'get_all' });
        data = await actionNews.getActionData(actionParams);

        if (!data) {
          params.status = 'error';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        return new Responser(res, req, params, null, 200, data, dbm).emit();
      } catch (err) {
        console.error(err);
        params.done = false;
        params.status = 'FAIL';
        res.status(503);
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }
  }
}

export default News;
