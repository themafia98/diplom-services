import { NextFunction, Response, Request } from 'express';
import url from 'url';
import querystring from 'querystring';
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
  User,
  JsonConfig,
  RequestWithParams,
  Runner,
} from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';
import Decorators from '../../Utils/decorators';
import AccessRole from '../../Models/AccessRole';
import { UserModel } from '../../Models/Database/Schema';
import { createParams, getFileStorage } from '../Controllers.utils';
import { NOTIFICATION_TYPE } from './MainController.constant';
import { MAIN_ROUTE } from './Main.path';
import Utils from '../../Utils/utils.global';
import { Types } from 'mongoose';
import Responser from '../../Models/Responser';
import ActionRunner from '../../Models/ActionRunner/ActionRunner';
import { ENTITY } from '../../Models/Database/Schema/Schema.constant';

namespace System {
  const readFile = promisify(fs.readFile);
  const Controller = Decorators.Controller;
  const Delete = Decorators.Delete;
  const Post = Decorators.Post;
  const Get = Decorators.Get;
  const Put = Decorators.Put;

  @Controller('/system')
  export class SystemData implements ControllerApi<FunctionConstructor> {
    @Get({ path: MAIN_ROUTE[Utils.getVersion()].CORE_APP_CONFIG, private: false })
    protected async loadSystemConfig(req: Request, res: Response): ResRequest {
      const { uid = '' } = req as Record<string, any>;

      const { type = 'public' } = req.params;
      try {
        const config: Buffer = await readFile(path.join(__dirname, '../../', 'core', type, 'config.json'));
        const configPublic: Buffer | null =
          type === 'private'
            ? await readFile(path.join(__dirname, '../../', 'core', 'public', 'config.json'))
            : null;

        if (!config || (type === 'private' && !configPublic)) {
          throw new Error('Bad config.json');
        }

        const parsedJsonPublicConfig: JsonConfig = JSON.parse(config as any);
        let parseConfig = parsedJsonPublicConfig;

        if (type === 'private') {
          const user = (await UserModel.findById(Types.ObjectId(uid))) as User;

          const accessUser: AccessRole = new AccessRole(user as User, parsedJsonPublicConfig);

          const jsonPrivateConfig: Record<string, object[]> = JSON.parse(configPublic as any);

          const parsedJsonPrivateConfig = {
            ...jsonPrivateConfig,
            menu: accessUser.menu,
          };

          parseConfig = {
            ...parsedJsonPublicConfig,
            ...parsedJsonPrivateConfig,
            lang: user ? user.lang : 'en',
          };

          if (user) {
            await UserModel.updateOne({ _id: Types.ObjectId(uid) }, { access: accessUser.config });
          }
        }

        res.json(parseConfig);
      } catch (error) {
        if (!res.headersSent) return res.sendStatus(503);
      }
    }

    @Get({ path: MAIN_ROUTE[Utils.getVersion()].USERS_LIST, private: true })
    protected async getUsersList(req: Request, res: Response): ResRequest {
      const { query } = url.parse(req.url);
      const queryString = querystring.parse(query as string);

      const params: Params = createParams('get_all', 'done', ENTITY.USERS);
      const actionUserList: Runner = new ActionRunner({
        actionPath: ENTITY.USERS,
        actionType: 'get_all',
      });

      const responseExec: Function = await actionUserList.start({}, '', queryString);
      return responseExec(req, res, params, true);
    }

    @Post({ path: MAIN_ROUTE[Utils.getVersion()].SAVE_FILE, private: true, file: true })
    protected async saveFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { module: moduleName = '' } = req.params;
      const { dropbox } = server.locals;
      const params: Params = createParams('save_file', 'done', moduleName);

      const files: Express.Multer.File[] = req.files as Express.Multer.File[];
      const saveFileAction: Runner = new ActionRunner({
        actionPath: 'global',
        actionType: 'save_file',
        store: getFileStorage({ dropbox } as Record<string, FileApi>) as FileApi,
      });

      const responseExec: Function = await saveFileAction.start({ files, moduleName });
      return responseExec(req, res, params);
    }

    @Put({ path: MAIN_ROUTE[Utils.getVersion()].LOAD_FILE, private: true })
    protected async loadTaskFiles(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { module: moduleName = '' } = req.params;
      const { dropbox } = server.locals;

      const params: Params = createParams('load_files', 'done', moduleName);

      const downloadAction: Runner = new ActionRunner({
        actionPath: 'global',
        actionType: 'load_files',
        store: getFileStorage({ dropbox } as Record<string, FileApi>) as FileApi,
      });

      const body = {
        body: req.body,
        moduleName,
      };

      const responseExec: Function = await downloadAction.start(body);
      return responseExec(req, res, params);
    }

    @Get({ path: MAIN_ROUTE[Utils.getVersion()].DOWNLOAD_FILE, private: true })
    protected async downloadFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { entityId = '', filename = '', module: moduleName = '' } = req.params;
      const params: Params = createParams('download_files', 'done', 'tasks');

      const { dropbox } = server.locals;

      const downloadAction: Runner = new ActionRunner({
        actionPath: 'global',
        actionType: 'download_files',
        store: getFileStorage({ dropbox } as Record<string, FileApi>) as FileApi,
      });

      const responseExec: Function = await downloadAction.start({
        entityId,
        moduleName,
        filename,
      });
      responseExec(req, res, params);
    }

    @Delete({ path: MAIN_ROUTE[Utils.getVersion()].DELETE_FILE, private: true })
    protected async deleteTaskFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dropbox } = server.locals;
      const { module: moduleName = '' } = req.params;

      const params: Params = createParams('delete_file', 'done', moduleName);

      const deleteFileAction: Runner = new ActionRunner({
        actionPath: 'global',
        actionType: 'delete_file',
        store: getFileStorage({ dropbox } as Record<string, FileApi>) as FileApi,
      });

      const body = {
        body: { ...req.body },
        store: `/${moduleName}`,
      };
      const responseExec: Function = await deleteFileAction.start(body);
      return responseExec(req, res, params);
    }

    @Post({ path: MAIN_ROUTE[Utils.getVersion()].UPDATE_SINGLE, private: true })
    protected async updateSingle(req: Request, res: Response): ResRequest {
      const { module: moduleName = '' } = req.params;
      const { params: paramsRequest = {} } = req.body;

      const params: Params = createParams('update_single', 'done', moduleName);

      const updateSingleAction: Runner = new ActionRunner({
        actionPath: moduleName,
        actionType: 'update_single',
        body: paramsRequest,
      });

      const responseExec: Function = await updateSingleAction.start(paramsRequest);
      return responseExec(req, res, params);
    }

    @Post({ path: MAIN_ROUTE[Utils.getVersion()].UPDATE_MANY, private: true })
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

      const params: Params = createParams('update_many', 'done', moduleName);

      const updateManyAction: Runner = new ActionRunner({
        actionPath: moduleName,
        actionType: 'update_many',
        body: actionParams,
      });

      const responseExec: Function = await updateManyAction.start(actionParams);
      return responseExec(req, res, params, true);
    }

    @Post({ path: MAIN_ROUTE[Utils.getVersion()].LOAD_NOTIFICATION, private: true })
    protected async notification(req: Request, res: Response): ResRequest {
      const { type: notificationType = '' } = req.params;
      const params: Params = createParams(notificationType, 'done', ENTITY.NOTIFICATION);

      if (Object.values(NOTIFICATION_TYPE).every((type) => type !== notificationType)) {
        return res.sendStatus(500);
      }

      const { actionType = '', params: paramsRequest = {} } = req.body;

      /**
       * item is new notification
       */
      const { options = {}, item = {} } = paramsRequest || {};

      const createNotificationAction: Runner = new ActionRunner({
        actionPath: ENTITY.NOTIFICATION,
        actionType: actionType as string,
      });

      const responseExec: Function = await createNotificationAction.start({
        ...options,
        item,
        type: notificationType,
      });
      return responseExec(req, res, params, true);
    }

    @Post({ path: MAIN_ROUTE[Utils.getVersion()].SYNC, private: true })
    protected async syncClientData(req: Request, res: Response): ResRequest {
      const { module: moduleName = '' } = req.params;

      const params: Params = createParams('sync', 'done', 'sync_all');
      const body: BodyLogin = req.body;

      const syncAction: Runner = new ActionRunner({
        actionPath: moduleName,
        actionType: 'sync',
        body,
      });

      const responseExec: Function = await syncAction.start(body);
      return responseExec(req, res, params);
    }

    @Post({ path: MAIN_ROUTE[Utils.getVersion()].CHECK_AVAILABLE_PAGE, private: true })
    protected async checkPage(req: Request, res: Response): ResRequest {
      const activePage = req.body;

      if (!activePage) {
        return new Responser(res, req, {} as Params, null, 404, []).sendMessage();
        return;
      }

      if (!(<RequestWithParams>req).shouldBeView) {
        return new Responser(res, req, {} as Params, null, 403, []).sendMessage();
      }

      return new Responser(res, req, {} as Params, null, 200, []).sendMessage();
    }
  }
}

export default System;
