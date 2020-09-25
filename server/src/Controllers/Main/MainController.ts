import { NextFunction, Response, Request } from 'express';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import _ from 'lodash';
import {
  App,
  Params,
  FileApi,
  Controller as ControllerApi,
  BodyLogin,
  Actions,
  ActionParams,
  User,
  JsonConfig,
  AccessConfig,
} from '../../Utils/Interfaces';
import { ResRequest } from '../../Utils/Types';

import Decorators from '../../Decorators';
import Action from '../../Models/Action';
import AccessRole from '../../Models/AccessRole';
import { UserModel } from '../../Models/Database/Schema';

namespace System {
  const readFile = promisify(fs.readFile);
  const Controller = Decorators.Controller;
  const Delete = Decorators.Delete;
  const Post = Decorators.Post;
  const Get = Decorators.Get;
  const Put = Decorators.Put;

  @Controller('/system')
  export class SystemData implements ControllerApi<FunctionConstructor> {
    @Get({ path: '/core/:type/config', private: false })
    protected async loadSystemConfig(req: Request, res: Response): ResRequest {
      const { uid = '' } = req as Record<string, any>;

      const { type = 'public' } = req.params;
      try {
        const config: Buffer = await readFile(path.join(__dirname, '../../', 'core', type, 'config.json'));
        const configPublic: Buffer | null =
          type === 'private'
            ? await readFile(path.join(__dirname, '../../', 'core', 'public', 'config.json'))
            : null;

        if (!config || (type === 'private' && !configPublic)) throw new Error('Bad config.json');

        const parsedJsonPublicConfig: JsonConfig = JSON.parse(config as any);
        let parseConfig = parsedJsonPublicConfig;

        if (type === 'private') {
          const user = await UserModel.findOne({ _id: uid });

          const accessUser: AccessRole = new AccessRole(user as User, parsedJsonPublicConfig);

          const jsonPrivateConfig: Record<string, object[]> = JSON.parse(configPublic as any);

          const parsedJsonPrivateConfig = {
            ...jsonPrivateConfig,
            menu: accessUser.menu,
          };

          parseConfig = {
            ...parsedJsonPublicConfig,
            ...parsedJsonPrivateConfig,
          };

          if (req.session) (<Record<string, AccessConfig[]>>req.session).access = accessUser.config;
        }

        res.json(parseConfig);
      } catch (error) {
        if (!res.headersSent) return res.sendStatus(503);
      }
    }

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
      const { dropbox: store } = server.locals;
      const params: Params = {
        methodQuery: 'save_file',
        status: 'done',
        done: true,
        from: moduleName,
      };

      const files: ActionParams = req.files as any;
      const saveFileAction: Actions = new Action.ActionParser({
        actionPath: 'global',
        actionType: 'save_file',
        store,
      });

      const responseExec: Function = await saveFileAction.actionsRunner({ files, moduleName });
      return responseExec(req, res, params);
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
      const { dropbox: store } = server.locals;
      const downloadAction: Actions = new Action.ActionParser({
        actionPath: 'global',
        actionType: 'download_files',
        store,
      });

      const responseExec: Function = await downloadAction.actionsRunner({
        entityId,
        moduleName,
        filename,
      });
      responseExec(req, res, params);
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
      const { params: paramsRequest = {} } = req.body || {};

      const params: Params = {
        methodQuery: 'update_single',
        status: 'done',
        done: true,
        from: moduleName,
      };
      const updateSingleAction: Actions = new Action.ActionParser({
        actionPath: moduleName,
        actionType: 'update_single',
        body: paramsRequest,
      });

      const responseExec: Function = await updateSingleAction.actionsRunner(paramsRequest);
      return responseExec(req, res, params);
    }

    @Post({ path: '/:module/update/many', private: true })
    protected async updateMany(req: Request, res: Response): ResRequest {
      const { module: moduleName = '' } = req.params;
      const { params: paramsRequest = {} } = req.body;

      const actionParams =
        typeof paramsRequest == 'object' && paramsRequest
          ? {
              moduleName,
              ...paramsRequest,
            }
          : {};

      const params: Params = {
        methodQuery: 'update_many',
        status: 'done',
        done: true,
        from: moduleName,
      };

      const updateManyAction: Actions = new Action.ActionParser({
        actionPath: moduleName,
        actionType: 'update_many',
        body: actionParams,
      });

      const responseExec: Function = await updateManyAction.actionsRunner(actionParams);
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

      const { actionType = '', params: paramsRequest = {} } = req.body;

      /**
       * item is new notification
       */
      const { options = {}, item = {} } = paramsRequest || {};

      const createNotificationAction: Actions = new Action.ActionParser({
        actionPath: 'notification',
        actionType: actionType as string,
      });

      const responseExec: Function = await createNotificationAction.actionsRunner({ ...options, item, type });
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
