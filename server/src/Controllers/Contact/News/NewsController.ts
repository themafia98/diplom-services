import { NextFunction, Response, Request } from 'express';
import { App, Params, ActionParams } from '../../../Utils/Interfaces';
import { ParserResult, Decorator, ResRequest } from '../../../Utils/Types';
import Utils from '../../../Utils';
import Decorators from '../../../Decorators';
import Action from '../../../Models/Action';

namespace News {
  const { getResponseJson } = Utils;
  const Controller = Decorators.Controller;
  const Post = Decorators.Post;
  const Get = Decorators.Get;

  @Controller('/news')
  export class NewsController {
    @Post({ path: '/createNews', private: true })
    public async createNews(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      try {
        const bodyRequest = <Record<string, any>>req.body;
        const service = server.locals;
        const connect = await service.dbm.connection().catch((err: Error) => {
          console.error(err);
        });

        const {
          queryParams: { actionType = '' },
        } = bodyRequest;
        const body: ActionParams = bodyRequest.metadata;

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
          res.status(404);
          return res.json(
            getResponseJson(
              'error',
              { status: 'FAIL', params, done: false, metadata: [] },
              (req as Record<string, any>).start,
            ),
          );
        }

        await service.dbm.disconnect().catch((err: Error) => console.error(err));

        return res.json(
          getResponseJson(
            'done',
            { status: 'OK', params, done: true, metadata: data },
            (req as Record<string, any>).start,
          ),
        );
      } catch (err) {
        console.error(err);
        if (!res.headersSent) {
          const bodyRequest = <Record<string, any>>req.body;
          const {
            queryParams: { actionType = '' },
          } = bodyRequest;

          const params: Params = {
            methodQuery: actionType,
            status: 'done',
            done: true,
            from: 'news',
          };
          res.status(503);
          return res.json(
            getResponseJson(
              err.name,
              { status: 'Server error', params, done: false, metadata: [] },
              (req as Record<string, any>).start,
            ),
          );
        }
      }
    }

    @Post({ path: '/list', private: true })
    @Get({ path: '/list', private: true })
    public async getNewsList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'news' };
      try {
        const service = server.locals;
        const connect = await service.dbm.connection().catch((err: Error) => {
          console.error(err);
        });

        if (!connect) throw new Error('Bad connect');

        const { options: { limitList = null, keys = null } = {} } = req?.body || {};
        const actionParams: ActionParams = { queryParams: keys ? { keys } : {}, limitList };

        const actionNews = new Action.ActionParser({ actionPath: 'news', actionType: 'get_all' });
        const data: Readonly<ParserResult> = await actionNews.getActionData(actionParams);

        if (!data) {
          params.status = 'error';
          res.status(404);
          return res.json(
            getResponseJson(
              'error',
              { status: 'FAIL', done: false, params, metadata: [] },
              (req as Record<string, any>).start,
            ),
          );
        }

        await service.dbm.disconnect().catch((err: Error) => console.error(err));

        return res.json(
          getResponseJson(
            'done',
            { status: 'OK', done: true, params, metadata: data },
            (req as Record<string, any>).start,
          ),
        );
      } catch (err) {
        console.error(err);
        if (!res.headersSent) {
          params.done = false;
          params.status = 'FAIL';
          res.status(503);
          return res.json(
            getResponseJson(
              err.name,
              { status: 'Server error', params, done: false, metadata: [] },
              (req as Record<string, any>).start,
            ),
          );
        }
      }
    }
  }
}

export default News;
