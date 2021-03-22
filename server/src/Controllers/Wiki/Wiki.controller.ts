import { Response, Request } from 'express';
import _ from 'lodash';
import { Params, ActionParams, Controller as ControllerApi } from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';
import Decorators from '../../Utils/decorators';
import { createParams } from '../Controllers.utils';
import { WIKI_ROUTE } from './Wiki.path';
import Utils from '../../Utils/utils.global';
import ActionRunner from '../../Models/ActionRunner';

namespace Wiki {
  const Controller = Decorators.Controller;
  const Delete = Decorators.Delete;
  const Put = Decorators.Put;
  const Get = Decorators.Get;
  const Post = Decorators.Post;

  @Controller('/wiki')
  export class WikiController implements ControllerApi<FunctionConstructor> {
    @Get({ path: WIKI_ROUTE[Utils.getVersion()].LOAD_WIKI_PAGES_LIST, private: true })
    protected async getTreeList(req: Request, res: Response): ResRequest {
      const params: Params = createParams('get_all', 'done', 'wiki');

      const actionTreeList = new ActionRunner({
        actionPath: 'wiki',
        actionType: 'get_all',
      });

      const responseExec: Function = await actionTreeList.start({});
      return responseExec(req, res, params);
    }

    @Put({ path: WIKI_ROUTE[Utils.getVersion()].CREATE_LEAF, private: true })
    protected async createLeaf(req: Request, res: Response): ResRequest {
      const params: Params = createParams('create_leaf', 'done', 'wiki');
      const { params: leafEntity = {} } = req.body;

      const actionCreateLeaf = new ActionRunner({
        actionPath: 'wiki',
        actionType: 'create_leaf',
      });

      const responseExec: Function = await actionCreateLeaf.start(leafEntity);
      return responseExec(req, res, params);
    }

    @Delete({ path: WIKI_ROUTE[Utils.getVersion()].DELETE_LEAF, private: true })
    protected async deleteLeafs(req: Request, res: Response): ResRequest {
      const params: Params = createParams('delete_leafs', 'done', 'wiki');

      const { params: leafParam = {} } = req.body;

      const actionDeleteLeafs = new ActionRunner({
        actionPath: 'wiki',
        actionType: 'delete_leafs',
      });

      const responseExec: Function = await actionDeleteLeafs.start(leafParam);
      return responseExec(req, res, params);
    }

    @Post({ path: WIKI_ROUTE[Utils.getVersion()].LOAD_WIKI_PAGE, private: true })
    protected async getWikiPage(req: Request, res: Response): ResRequest {
      const params: Params = createParams('wiki_page', 'done', 'wiki');
      const body: ActionParams = req.body;

      const actionWikiPage = new ActionRunner({
        actionPath: 'wiki',
        actionType: 'wiki_page',
      });

      const responseExec: Function = await actionWikiPage.start(body);
      return responseExec(req, res, params);
    }
  }
}

export default Wiki;
