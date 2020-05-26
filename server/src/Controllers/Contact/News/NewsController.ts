import { NextFunction, Response, Request } from 'express';
import { Params, ActionParams, Controller as ControllerApi, BodyLogin } from '../../../Utils/Interfaces';
import { ResRequest } from '../../../Utils/Types';

import Decorators from '../../../Decorators';
import Action from '../../../Models/Action';

namespace News {
  const Controller = Decorators.Controller;
  const Post = Decorators.Post;
  const Get = Decorators.Get;

  @Controller('/news')
  export class NewsController implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/createNews', private: true })
    protected async createNews(req: Request, res: Response): ResRequest {
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

      const responseExec: Function = await actionNews.actionsRunner(body);
      return responseExec(req, res, params);
    }

    @Post({ path: '/list', private: true })
    @Get({ path: '/list', private: true })
    protected async getNewsList(req: Request, res: Response, next: NextFunction): ResRequest {
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'news' };

      const { options: { limitList = null, keys = null } = {} } = req.body || {};
      const actionParams: ActionParams = { queryParams: keys ? { keys } : {}, limitList };

      const actionListNews = new Action.ActionParser({ actionPath: 'news', actionType: 'get_all' });

      const responseExec: Function = await actionListNews.actionsRunner(actionParams);
      return responseExec(req, res, params);
    }
  }
}

export default News;
