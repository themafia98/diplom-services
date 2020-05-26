import { NextFunction, Response, Request } from 'express';
import _ from 'lodash';
import {
  App,
  Params,
  FileApi,
  Controller as ControllerApi,
  BodyLogin,
  Actions,
} from '../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../Utils/Types';
import Responser from '../../Models/Responser';
import Decorators from '../../Decorators';
import Action from '../../Models/Action';
import { BinaryLike } from 'crypto';

namespace System {
  const Controller = Decorators.Controller;
  const Delete = Decorators.Delete;
  const Post = Decorators.Post;
  const Get = Decorators.Get;
  const Put = Decorators.Put;

  @Controller('/system')
  export class SystemData implements ControllerApi<FunctionConstructor> {
    @Get({ path: '/userList', private: true })
    protected async getUsersList(req: Request, res: Response): ResRequest {
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'users' };
      const actionUserList: Actions = new Action.ActionParser({
        actionPath: 'users',
        actionType: 'get_all',
      });
      const responseExec: Function = await actionUserList.actionsRunner({});
      return responseExec(req, res, params, true);
    }

    @Post({ path: '/:module/file', private: true, file: true })
    protected async saveFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { module: moduleName = '' } = req.params;
      const params: Params = {
        methodQuery: 'save_file',
        status: 'done',
        done: true,
        from: moduleName,
      };

      try {
        const files = Array.isArray(req.files) ? req.files : null;
        if (!files) throw new Error('Bad file');

        const { dropbox: store } = server.locals;
        let responseSave: Array<object | null> = [];

        for await (let file of files) {
          const [filename, entityId] = file.fieldname.split('__');
          const parseOriginalName = file.originalname.split(/\./gi);
          const ext = parseOriginalName[parseOriginalName.length - 1];

          const path: string = `/${moduleName}/${entityId}/${file.originalname}`;
          const result = await (store as FileApi).saveFile({ path, contents: file.buffer });

          if (result) {
            responseSave.push({
              name: result.name,
              isSave: true,
            });
          } else {
            responseSave.push({
              name: `${filename}.${ext}`,
              isSave: false,
            });
          }
        }

        responseSave = responseSave.filter(Boolean);

        if (!responseSave.length) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        return new Responser(res, req, params, null, 200, responseSave).emit();
      } catch (err) {
        params.done = false;
        console.log(err.message);
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Put({ path: '/:module/load/file', private: true })
    protected async loadTaskFiles(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { module: moduleName = '' } = req.params;
      const params: Params = {
        methodQuery: 'load_files',
        status: 'done',
        done: true,
        from: moduleName,
      };

      const { dropbox } = server.locals;
      const downloadAction: Actions = new Action.ActionParser({
        actionPath: 'global',
        actionType: 'load_files',
        store: <FileApi>dropbox,
      });

      const body = {
        body: req.body,
        moduleName,
      };

      const responseExec: Function = await downloadAction.actionsRunner(body);
      return responseExec(req, res, params);
    }

    @Get({ path: '/:module/download/:entityId/:filename', private: true })
    protected async downloadFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { entityId = '', filename = '', module: moduleName = '' } = req.params;
      const params: Params = {
        methodQuery: 'download_files',
        status: 'done',
        done: true,
        from: 'tasks',
      };

      try {
        if (!entityId || !filename) {
          params.done = false;
          params.status = 'FAIL NAME';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const { dropbox: store } = server.locals;
        const downloadAction: Actions = new Action.ActionParser({
          actionPath: 'global',
          actionType: 'download_files',
          store,
        });

        const actionData: ParserResult = await downloadAction.actionsRunner({
          entityId,
          moduleName,
          filename,
        });

        const isBinary: boolean = Boolean(
          actionData && (actionData as Record<string, BinaryLike>).fileBinary,
        );
        const fileBinary: BinaryLike | null = isBinary
          ? (actionData as Record<string, BinaryLike>).fileBinary
          : null;

        if (!actionData || !fileBinary) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, fileBinary).emit();
        }

        return res.send(Buffer.from(fileBinary));
      } catch (err) {
        console.error(err);
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Delete({ path: '/:module/delete/file', private: true })
    protected async deleteTaskFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dropbox: store } = server.locals;
      const { module: moduleName = '' } = req.params;
      const params: Params = {
        methodQuery: 'delete_file',
        status: 'done',
        done: true,
        from: moduleName,
      };

      const deleteFileAction: Actions = new Action.ActionParser({
        actionPath: 'global',
        actionType: 'delete_file',
        store,
      });

      const body = {
        body: { ...req.body },
        store: `/${moduleName}`,
      };
      const responseExec: Function = await deleteFileAction.actionsRunner(body);
      return responseExec(req, res, params);
    }

    @Post({ path: '/:module/update/single', private: true })
    protected async updateSingle(req: Request, res: Response): ResRequest {
      const { module: moduleName = '' } = req.params;
      const body: BodyLogin = req.body;
      const params: Params = {
        methodQuery: 'update_single',
        status: 'done',
        done: true,
        from: moduleName,
      };
      const updateSingleAction: Actions = new Action.ActionParser({
        actionPath: moduleName,
        actionType: 'update_single',
        body,
      });

      const responseExec: Function = await updateSingleAction.actionsRunner(body);
      return responseExec(req, res, params);
    }

    @Post({ path: '/:module/update/many', private: true })
    protected async updateMany(req: Request, res: Response): ResRequest {
      const { module: moduleName = '' } = req.params;
      const params: Params = {
        methodQuery: 'update_many',
        status: 'done',
        done: true,
        from: moduleName,
      };

      const body: BodyLogin = req.body;

      const updateManyAction: Actions = new Action.ActionParser({
        actionPath: moduleName,
        actionType: 'update_many',
        body,
      });

      const responseExec: Function = await updateManyAction.actionsRunner(body);
      return responseExec(req, res, params, true);
    }

    @Post({ path: '/:type/notification', private: true })
    protected async notification(req: Request, res: Response): ResRequest {
      const { type = '' } = req.params;
      const params: Params = {
        methodQuery: type,
        status: 'done',
        done: true,
        from: 'notification',
      };

      if (type !== 'private' && type !== 'global') {
        return res.sendStatus(500);
      }

      const body: BodyLogin = req.body;
      const { actionType = '' } = body;

      const createNotificationAction: Actions = new Action.ActionParser({
        actionPath: 'notification',
        actionType: actionType as string,
      });

      const responseExec: Function = await createNotificationAction.actionsRunner({ ...req.body, type });
      return responseExec(req, res, params, true);
    }

    @Post({ path: '/sync', private: true })
    protected async syncClientData(req: Request, res: Response): ResRequest {
      const { module: moduleName = '' } = req.params;
      const params: Params = {
        methodQuery: 'sync',
        status: 'done',
        done: true,
        from: 'sync_all',
      };
      const body: BodyLogin = req.body;

      const syncAction: Actions = new Action.ActionParser({
        actionPath: moduleName,
        actionType: 'sync',
        body,
      });

      const responseExec: Function = await syncAction.actionsRunner(body);
      return responseExec(req, res, params);
    }
  }
}

export default System;
