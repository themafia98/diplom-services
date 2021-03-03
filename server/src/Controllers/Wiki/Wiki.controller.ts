import { Response, Request } from 'express';
import _ from 'lodash';
import { Params, ActionParams, Controller as ControllerApi } from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';

import Decorators from '../../Utils/decorators';
import Action from '../../Models/Action';
import { createParams } from '../Controllers.utils';

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
      const params: Params = createParams('get_all', 'done', 'wiki');

      const actionTreeList = new Action.ActionParser({
        actionPath: 'wiki',
        actionType: 'get_all',
      });

      const responseExec: Function = await actionTreeList.actionsRunner({});
      return responseExec(req, res, params);
    }

    @Put({ path: '/createLeaf', private: true })
    protected async createLeaf(req: Request, res: Response): ResRequest {
      const params: Params = createParams('create_leaf', 'done', 'wiki');
      const { params: leafEntity = {} } = req.body;

      const actionCreateLeaf = new Action.ActionParser({
        actionPath: 'wiki',
        actionType: 'create_leaf',
      });

      const responseExec: Function = await actionCreateLeaf.actionsRunner(leafEntity);
      return responseExec(req, res, params);
    }

    @Delete({ path: '/deleteLeafs', private: true })
    protected async deleteLeafs(req: Request, res: Response): ResRequest {
      const params: Params = createParams('delete_leafs', 'done', 'wiki');

      const { params: leafParam = {} } = req.body;

      const actionDeleteLeafs = new Action.ActionParser({
        actionPath: 'wiki',
        actionType: 'delete_leafs',
      });

      const responseExec: Function = await actionDeleteLeafs.actionsRunner(leafParam);
      return responseExec(req, res, params);
    }

    @Post({ path: '/wikiPage', private: true })
    protected async getWikiPage(req: Request, res: Response): ResRequest {
      const params: Params = createParams('wiki_page', 'done', 'wiki');
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
