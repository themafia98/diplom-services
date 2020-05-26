import { Response, Request } from 'express';
import _ from 'lodash';
import { Params, ActionParams, Controller as ControllerApi } from '../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../Utils/Types';

import Responser from '../../Models/Responser';
import Decorators from '../../Decorators';
import Action from '../../Models/Action';

namespace Wiki {
  const Controller = Decorators.Controller;
  const Delete = Decorators.Delete;
  const Put = Decorators.Put;
  const Get = Decorators.Get;
  const Post = Decorators.Post;

  @Controller('/wiki')
  export class WikiController implements ControllerApi<FunctionConstructor> {
    @Get({ path: '/list', private: true })
    protected async getTreeList(req: Request, res: Response): ResRequest {
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'wiki' };
      try {
        const actionTreeList = new Action.ActionParser({
          actionPath: 'wiki',
          actionType: 'get_all',
        });
        const data: ParserResult = await actionTreeList.getActionData({});

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const metadata: Array<object> = (data as Array<object>).reverse();
        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Put({ path: '/createLeaf', private: true })
    protected async createLeaf(req: Request, res: Response): ResRequest {
      const params: Params = { methodQuery: 'create_leaf', status: 'done', done: true, from: 'wiki' };
      try {
        const body: ActionParams = req.body;
        const actionCreateLeaf = new Action.ActionParser({
          actionPath: 'wiki',
          actionType: 'create_leaf',
        });

        const data: ParserResult = await actionCreateLeaf.getActionData(body);

        // TODO: delay disabled filter
        // const metadata: ArrayLike<object> = Utils.parsePublicData(data, 'accessGroups', rules);

        const metadata = _.isPlainObject(data) ? [data] : data;

        if (!data || !metadata) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Delete({ path: '/deleteLeafs', private: true })
    protected async deleteLeafs(req: Request, res: Response): ResRequest {
      const params: Params = { methodQuery: 'delete_leafs', status: 'done', done: true, from: 'wiki' };
      try {
        const body: ActionParams = req.body;

        const actionDeleteLeafs = new Action.ActionParser({
          actionPath: 'wiki',
          actionType: 'delete_leafs',
        });

        const data: ParserResult = await actionDeleteLeafs.getActionData(body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const { deletedCount = 0, ok = 0 } = (data as Record<string, number>) || {};
        const metadata: Record<string, number> = { deletedCount, ok };

        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Post({ path: '/wikiPage', private: true })
    protected async getWikiPage(req: Request, res: Response): ResRequest {
      const params: Params = { methodQuery: 'wiki_page', status: 'done', done: true, from: 'wiki' };
      try {
        const body: ActionParams = req.body;

        const actionWikiPage = new Action.ActionParser({
          actionPath: 'wiki',
          actionType: 'wiki_page',
        });

        const data: ParserResult = await actionWikiPage.getActionData(body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        return new Responser(res, req, params, null, 200, data).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }
  }
}

export default Wiki;
