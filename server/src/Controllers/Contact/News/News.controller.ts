import { NextFunction, Response, Request } from 'express';
import {
  ActionParams,
  Controller as ControllerApi,
  BodyLogin,
  Params,
  QueryParams,
} from '../../../Utils/Interfaces/Interfaces.global';
import { Meta, ResRequest } from '../../../Utils/Types/types.global';

import Decorators from '../../../Utils/decorators';
import Action from '../../../Models/Action';
import { createParams } from '../../Controllers.utils';
import { NEWS_ROUTE } from './News.path';
import Utils from '../../../Utils/utils.global';

namespace News {
  const Controller = Decorators.Controller;
  const Post = Decorators.Post;
  const Get = Decorators.Get;

  @Controller('/news')
  export class NewsController implements ControllerApi<FunctionConstructor> {
    @Post({ path: NEWS_ROUTE[Utils.getVersion()].CREATE_NEWS, private: true })
    protected async createNews(req: Request, res: Response): ResRequest {
      const body: BodyLogin = req.body;

      const { params: bodyParams = {} } = body as Record<string, ActionParams>;
      const { queryParams = {}, metadata = {} } = bodyParams;

      const { actionType = '' } = queryParams as QueryParams;

      const params: Params = createParams(actionType, 'done', 'news');
      const { shouldBeCreate = false } = req as Record<string, any>;

      if (!shouldBeCreate) {
        params.customErrorMessage = 'Access error for create news';
      }

      const actionNews = new Action.ActionParser({ actionPath: 'news', actionType });

      const responseExec: Function = await actionNews.actionsRunner(shouldBeCreate ? <Meta>metadata : {});
      return responseExec(req, res, params);
    }

    @Post({ path: NEWS_ROUTE[Utils.getVersion()].LOAD_NEWS, private: true })
    @Get({ path: NEWS_ROUTE[Utils.getVersion()].LOAD_NEWS, private: true })
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
