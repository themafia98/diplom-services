import { NextFunction, Response, Request } from 'express';
import _ from 'lodash';
import { Document } from 'mongoose';
import {
  App,
  Params,
  FileApi,
  Controller as ControllerApi,
  BodyLogin,
  Actions,
} from '../../Utils/Interfaces';
import { ParserResult, ResRequest, Meta } from '../../Utils/Types';
import Utils from '../../Utils';
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
    protected async getUsersList(req: Request, res: Response, next: NextFunction): ResRequest {
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'users' };
      try {
        const actionUserList: Actions = new Action.ActionParser({
          actionPath: 'users',
          actionType: 'get_all',
        });
        const data: ParserResult = await actionUserList.getActionData({});

        if (!data) {
          params.status = 'error';
          params.done = false;
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const metadata: Meta = Utils.parsePublicData(data);

        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.error(err);
        params.done = false;
        params.status = 'FAIL';
        return new Responser(res, req, params, err, 503, []).emit();
      }
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

      try {
        const downloadAction: Actions = new Action.ActionParser({
          actionPath: 'global',
          actionType: 'load_files',
          store: <FileApi>dropbox,
        });

        const data: ParserResult = await downloadAction.getActionData({
          body: req.body,
          moduleName,
        });

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const metadata: ParserResult = (data as Document[]).entries;
        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        params.done = false;
        console.error(err);
        return new Responser(res, req, params, err, 503, []).emit();
      }
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

        const actionData: ParserResult = await downloadAction.getActionData({
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

      try {
        const deleteFileAction: Actions = new Action.ActionParser({
          actionPath: 'global',
          actionType: 'delete_file',
          store,
        });

        const actionData: ParserResult = await deleteFileAction.getActionData({
          body: { ...req.body },
          store: `/${moduleName}`,
        });

        return new Responser(res, req, { ...req.body, ...params }, null, 200, actionData).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Post({ path: '/:module/update/single', private: true })
    protected async updateSingle(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { module: moduleName = '' } = req.params;
      const body: object = req.body;
      const params: Params = {
        methodQuery: 'update_single',
        status: 'done',
        done: true,
        from: moduleName,
      };
      try {
        if (!req.body || _.isEmpty(req.body)) {
          params.done = false;
          params.status = 'FAIL BODY';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const createTaskAction: Actions = new Action.ActionParser({
          actionPath: moduleName,
          actionType: 'update_single',
          body,
        });

        const data: ParserResult = await createTaskAction.getActionData(req.body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, data).emit();
        }

        const meta = Utils.parsePublicData([data] as ParserResult) as ArrayLike<object>;
        const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

        return new Responser(res, req, { ...req.body, ...params }, null, 200, metadata).emit();
      } catch (err) {
        console.log(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Post({ path: '/:module/update/many', private: true })
    protected async updateMany(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { module: moduleName = '' } = req.params;
      const params: Params = {
        methodQuery: 'update_many',
        status: 'done',
        done: true,
        from: moduleName,
      };

      try {
        if (!req.body || _.isEmpty(req.body)) {
          params.done = false;
          params.status = 'FAIL BODY';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const body: object = req.body;

        const createTaskAction: Actions = new Action.ActionParser({
          actionPath: moduleName,
          actionType: 'update_many',
          body,
        });

        const data: ParserResult = await createTaskAction.getActionData(req.body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const meta = Utils.parsePublicData([data] as ParserResult) as ArrayLike<object>;
        const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.error(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Post({ path: '/:type/notification', private: true })
    protected async notification(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { type = '' } = req.params;
      const params: Params = {
        methodQuery: type,
        status: 'done',
        done: true,
        from: 'notification',
      };

      try {
        if (type !== 'private' && type !== 'global') {
          throw new TypeError('Bad type notification');
        }

        if (!req.body || _.isEmpty(req.body)) {
          params.done = false;
          params.status = 'FAIL BODY';
          return new Responser(res, req, params, null, 404, []).emit();
        }
        const body: BodyLogin = req.body;
        const { actionType = '' } = body;

        const createNotificationAction: Actions = new Action.ActionParser({
          actionPath: 'notification',
          actionType: actionType as string,
        });

        const data: ParserResult = await createNotificationAction.getActionData({ ...req.body, type });

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const sortData = Array.isArray(data) ? data.reverse() : data;
        return new Responser(res, req, params, null, 200, sortData).emit();
      } catch (err) {
        console.error(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }

    @Post({ path: '/sync', private: true })
    protected async syncClientData(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { module: moduleName = '' } = req.params;
      const params: Params = {
        methodQuery: 'sync',
        status: 'done',
        done: true,
        from: 'sync_all',
      };

      try {
        if (!req.body || _.isEmpty(req.body)) {
          params.done = false;
          params.status = 'FAIL BODY';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const body: object = req.body;

        const syncAction: Actions = new Action.ActionParser({
          actionPath: moduleName,
          actionType: 'sync',
          body,
        });

        const data: ParserResult = await syncAction.getActionData(req.body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, []).emit();
        }

        const metadata: any = Array.isArray(data as object) ? data : [data as object];

        return new Responser(res, req, params, null, 200, metadata).emit();
      } catch (err) {
        console.error(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, []).emit();
      }
    }
  }
}

export default System;
