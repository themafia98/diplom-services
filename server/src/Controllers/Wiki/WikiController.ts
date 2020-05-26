import { Response, Request } from 'express';
import _ from 'lodash';
import { Params, ActionParams, Controller as ControllerApi } from '../../Utils/Interfaces';
import { ResRequest } from '../../Utils/Types';

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

      const actionTreeList = new Action.ActionParser({
        actionPath: 'wiki',
        actionType: 'get_all',
      });

      const responseExec: Function = await actionTreeList.actionsRunner({});
      return responseExec(req, res, params);
    }

    @Put({ path: '/createLeaf', private: true })
    protected async createLeaf(req: Request, res: Response): ResRequest {
      const params: Params = { methodQuery: 'create_leaf', status: 'done', done: true, from: 'wiki' };

      const body: ActionParams = req.body;
      const actionCreateLeaf = new Action.ActionParser({
        actionPath: 'wiki',
        actionType: 'create_leaf',
      });

      const responseExec: Function = await actionCreateLeaf.actionsRunner(body);
      return responseExec(req, res, params);
    }

    @Delete({ path: '/deleteLeafs', private: true })
    protected async deleteLeafs(req: Request, res: Response): ResRequest {
      const params: Params = { methodQuery: 'delete_leafs', status: 'done', done: true, from: 'wiki' };

      const body: ActionParams = req.body;

      const actionDeleteLeafs = new Action.ActionParser({
        actionPath: 'wiki',
        actionType: 'delete_leafs',
      });

      const responseExec: Function = await actionDeleteLeafs.actionsRunner(body);
      return responseExec(req, res, params);
    }

    @Post({ path: '/wikiPage', private: true })
    protected async getWikiPage(req: Request, res: Response): ResRequest {
      const params: Params = { methodQuery: 'wiki_page', status: 'done', done: true, from: 'wiki' };

      const body: ActionParams = req.body;

      const actionWikiPage = new Action.ActionParser({
        actionPath: 'wiki',
        actionType: 'wiki_page',
      });

      const responseExec: Function = await actionWikiPage.actionsRunner(body);
      return responseExec(req, res, params);
    }
  }
}

export default Wiki;
