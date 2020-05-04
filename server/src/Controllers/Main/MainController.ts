import { NextFunction, Response, Request } from 'express';
import _ from 'lodash';
import { Document } from 'mongoose';
import { App, Params, FileApi, Controller, BodyLogin, Actions } from '../../Utils/Interfaces';
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
  export class SystemData implements Controller<FunctionConstructor> {
    @Get({ path: '/userList', private: true })
    protected async getUsersList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
      const params: Params = { methodQuery: 'get_all', status: 'done', done: true, from: 'users' };
      try {
        const connect = await dbm.connection().catch((err: Error) => console.error(err));
        if (!connect) throw new Error('Bad connect');

        const actionUserList: Actions = new Action.ActionParser({
          actionPath: 'users',
          actionType: 'get_all',
        });
        const data: ParserResult = await actionUserList.getActionData({});

        if (!data) {
          params.status = 'error';
          params.done = false;
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const metadata: Meta = Utils.parsePublicData(data);

        return new Responser(res, req, params, null, 200, metadata, dbm).emit();
      } catch (err) {
        console.error(err);
        params.done = false;
        params.status = 'FAIL';
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Post({ path: '/:module/file', private: true, file: true })
    protected async saveFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
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
          const result = await (<FileApi>store).saveFile({ path, contents: file.buffer });

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
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        return new Responser(res, req, params, null, 200, responseSave, dbm).emit();
      } catch (err) {
        params.done = false;
        console.log(err.message);
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Put({ path: '/:module/load/file', private: true })
    protected async loadTaskFiles(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
      const { module: moduleName = '' } = req.params;
      const params: Params = {
        methodQuery: 'load_files',
        status: 'done',
        done: true,
        from: moduleName,
      };

      try {
        const downloadAction: Actions = new Action.ActionParser({
          actionPath: 'global',
          actionType: 'load_files',
          store: <FileApi>server.locals.dropbox,
        });

        const data: ParserResult = await downloadAction.getActionData({
          body: req.body,
          moduleName,
        });

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const metadata: ParserResult = (<Document[]>data).entries;
        return new Responser(res, req, params, null, 200, metadata, dbm).emit();
      } catch (err) {
        params.done = false;
        console.error(err);
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Get({ path: '/:module/download/:entityId/:filename', private: true })
    protected async downloadFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
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
          return new Responser(res, req, params, null, 404, [], dbm).emit();
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
          actionData && (actionData as Record<string, BinaryLike>)?.fileBinary,
        );
        const fileBinary: BinaryLike | null = isBinary
          ? (actionData as Record<string, BinaryLike>).fileBinary
          : null;

        if (!actionData || !fileBinary) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, fileBinary, dbm).emit();
        }

        return res.send(Buffer.from(fileBinary));
      } catch (err) {
        console.error(err);
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Delete({ path: '/:module/delete/file', private: true })
    protected async deleteTaskFile(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
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

        return new Responser(res, req, { ...req.body, ...params }, null, 200, actionData, dbm).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Post({ path: '/:module/update/single', private: true })
    protected async updateSingle(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
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
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const connect = await dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

        const createTaskAction: Actions = new Action.ActionParser({
          actionPath: moduleName,
          actionType: 'update_single',
          body,
        });

        const data: ParserResult = await createTaskAction.getActionData(req.body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, data, dbm).emit();
        }

        const meta = <ArrayLike<object>>Utils.parsePublicData(<ParserResult>[data]);
        const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

        return new Responser(res, req, { ...req.body, ...params }, null, 200, metadata, dbm).emit();
      } catch (err) {
        console.log(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Post({ path: '/:module/update/many', private: true })
    protected async updateMany(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
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
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const body: object = req.body;
        const connect = await dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

        const createTaskAction: Actions = new Action.ActionParser({
          actionPath: moduleName,
          actionType: 'update_many',
          body,
        });

        const data: ParserResult = await createTaskAction.getActionData(req.body);

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const meta = <ArrayLike<object>>Utils.parsePublicData(<ParserResult>[data]);
        const metadata: ArrayLike<object> = Array.isArray(meta) && meta[0] ? meta[0] : null;

        return new Responser(res, req, params, null, 200, metadata, dbm).emit();
      } catch (err) {
        console.error(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Post({ path: '/:type/notification', private: true })
    protected async notification(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
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
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }
        const body: BodyLogin = req.body;
        const { actionType = '' } = body;
        const connect = await dbm.connection().catch((err: Error) => console.error(err));

        if (!connect) throw new Error('Bad connect');

        const createNotificationAction: Actions = new Action.ActionParser({
          actionPath: 'notification',
          actionType: <string>actionType,
        });

        const data: ParserResult = await createNotificationAction.getActionData({ ...req.body, type });

        if (!data) {
          params.done = false;
          params.status = 'FAIL';
          return new Responser(res, req, params, null, 404, [], dbm).emit();
        }

        const sortData = Array.isArray(data) ? data.reverse() : data;
        return new Responser(res, req, params, null, 200, sortData, dbm).emit();
      } catch (err) {
        console.error(err.message);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }
  }
}

export default System;
