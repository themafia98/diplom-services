import { Response, Request } from 'express';
import {
  ActionParams,
  Params,
  QueryParams,
  RequestWithParams,
  Runner,
} from '../../../Utils/Interfaces/Interfaces.global';
import { Meta, ResRequest } from '../../../Utils/Types/types.global';
import { Controller, Post, Put, Get } from '../../../Utils/decorators/Decorators';
import { createParams } from '../../Controllers.utils';
import { NEWS_ROUTE } from './News.path';
import { getVersion } from '../../../Utils/utils.global';
import ActionRunner from '../../../Models/ActionRunner/ActionRunner';
import { ENTITY } from '../../../Models/Database/Schema/Schema.constant';

@Controller('/news')
class NewsController {
  static version = getVersion();

  @Put({ path: NEWS_ROUTE[NewsController.version].CREATE_NEWS, private: true })
  protected async createNews(req: Request, res: Response): ResRequest {
    const { body } = req;

    const { params: bodyParams = {} } = body as Record<string, ActionParams>;
    const { queryParams = {}, metadata = {} } = bodyParams;

    const { actionType = '' } = queryParams as QueryParams;

    const params: Params = createParams(actionType, 'done', ENTITY.NEWS);
    const { shouldBeCreate = false } = req as RequestWithParams;

    if (!shouldBeCreate) {
      params.customErrorMessage = 'Access error for create news';
    }

    const actionNews = new ActionRunner({ actionPath: ENTITY.NEWS, actionType });

    const responseExec = await actionNews.start(shouldBeCreate ? <Meta>metadata : {});
    const execResult = responseExec(req, res, params);
    return execResult;
  }

  @Post({ path: NEWS_ROUTE[NewsController.version].LOAD_NEWS, private: true })
  @Get({ path: NEWS_ROUTE[NewsController.version].LOAD_NEWS, private: true })
  protected async getNewsList(req: Request, res: Response): ResRequest {
    const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: ENTITY.NEWS };

    const { params: paramsRequest = {} } = req.body;
    const { options: { limitList = null, keys = null } = {} } = paramsRequest || {};

    const actionParams: ActionParams = { queryParams: keys ? { keys } : {}, limitList };

    const actionListNews: Runner = new ActionRunner({ actionPath: ENTITY.NEWS, actionType: 'get_all' });

    const responseExec = await actionListNews.start(actionParams);
    return responseExec(req, res, params);
  }
}

export default NewsController;
