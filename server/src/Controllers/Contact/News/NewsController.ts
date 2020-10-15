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
      const body: BodyLogin = req.body;

      const { params: bodyParams = {} } = body as Record<string, any>;
      const { queryParams = {}, metadata = {} } = bodyParams;

      const { actionType = '' } = queryParams as Record<string, string>;

      const params: Params = {
        methodQuery: actionType,
        status: 'done',
        done: true,
        from: 'news',
      };

      const { shouldBeCreate = false } = req as Record<string, any>;

      if (!shouldBeCreate) {
        params.customErrorMessage = 'Access error for create news';
      }

      const actionNews = new Action.ActionParser({ actionPath: 'news', actionType });

      const responseExec: Function = await actionNews.actionsRunner(shouldBeCreate ? metadata : {});
      return responseExec(req, res, params);
    }

    @Post({ path: '/list', private: true })
    @Get({ path: '/list', private: true })
    protected async getNewsList(req: Request, res: Response, next: NextFunction): ResRequest {
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'news' };

      const { params: paramsRequest = {} } = req.body;
      const { options: { limitList = null, keys = null } = {} } = paramsRequest || {};

      const actionParams: ActionParams = { queryParams: keys ? { keys } : {}, limitList };

      const actionListNews = new Action.ActionParser({ actionPath: 'news', actionType: 'get_all' });

      const responseExec: Function = await actionListNews.actionsRunner(actionParams);
      return responseExec(req, res, params);
    }
  }
}

export default News;
