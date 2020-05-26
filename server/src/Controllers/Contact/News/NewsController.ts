import { NextFunction, Response, Request } from 'express';
import Responser from '../../../Models/Responser';
import { Params, ActionParams, Controller as ControllerApi, BodyLogin } from '../../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../../Utils/Types';

import Decorators from '../../../Decorators';
import Action from '../../../Models/Action';

namespace News {
  const Controller = Decorators.Controller;
  const Post = Decorators.Post;
  const Get = Decorators.Get;

  @Controller('/news')
  export class NewsController implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/createNews', private: true })
    protected async createNews(req: Request, res: Response, next: NextFunction): ResRequest {
      try {
        const bodyRequest: BodyLogin = req.body;

        const { queryParams = {} } = bodyRequest;
        const { actionType = '' } = queryParams as Record<string, string>;
        const body: ActionParams = bodyRequest.metadata as ActionParams;

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
          return new Responser(res, req, params, null, 404, []).emit();
        }

        return new Responser(res, req, params, null, 200, data).emit();
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
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Post({ path: '/list', private: true })
    @Get({ path: '/list', private: true })
    protected async getNewsList(req: Request, res: Response, next: NextFunction): ResRequest {
      let data: Readonly<ParserResult>;

      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'news' };
      try {
        const { options: { limitList = null, keys = null } = {} } = req.body || {};
        const actionParams: ActionParams = { queryParams: keys ? { keys } : {}, limitList };

        const actionNews = new Action.ActionParser({ actionPath: 'news', actionType: 'get_all' });
        data = await actionNews.getActionData(actionParams);

        if (!data) {
          params.status = 'error';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        return new Responser(res, req, params, null, 200, data).emit();
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
