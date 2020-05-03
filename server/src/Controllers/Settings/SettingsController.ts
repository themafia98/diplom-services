import { NextFunction, Response, Request } from 'express';
import _ from 'lodash';
import { App, Params, ActionParams, Controller } from '../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../Utils/Types';
import Responser from '../../Models/Responser';

import Action from '../../Models/Action';
import Decorators from '../../Decorators';

namespace Settings {
  const { Controller, Post, Put } = Decorators;

  @Controller('/settings')
  export class SettingsController implements Controller<FunctionConstructor> {
    @Post({ path: '/password', private: true })
    protected async passwordChanged(
      req: Request,
      res: Response,
      next: NextFunction,
      server: App,
    ): ResRequest {
      const { dbm } = server.locals;
      const params: Params = {
        methodQuery: 'change_password',
        from: 'users',
        done: true,
        status: 'OK',
      };
      try {
        const body: object = req.body;
        const queryParams: Record<string, any> = (<Record<string, any>>body).queryParams;

        if (!queryParams || _.isEmpty(queryParams)) {
          throw new Error('Invalid queryParams for change_password action');
        }

        const changePasswordAction = new Action.ActionParser({
          actionPath: 'users',
          actionType: 'change_password',
          body,
        });

        const actionParams: ActionParams = { queryParams };
        const data: ParserResult = await changePasswordAction.getActionData(actionParams);

        if (!data) throw new Error('Invalid change_password action data');
        else return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        params.done = false;
        params.status = 'FAIL';
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Post({ path: '/common', private: true })
    protected async commonSettings(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
      const params: Params = {
        methodQuery: 'common_changes',
        from: 'users',
        done: true,
        status: 'OK',
      };
      try {
        const body: object = req.body;
        const queryParams: Record<string, any> = (<Record<string, any>>body).queryParams;

        if (!queryParams || _.isEmpty(queryParams)) {
          throw new Error('Invalid queryParams for common_changes action');
        }

        const changeCommonAction = new Action.ActionParser({
          actionPath: 'users',
          actionType: 'common_changes',
        });

        const actionParams: ActionParams = { queryParams };
        const data: ParserResult = await changeCommonAction.getActionData(actionParams);

        if (!data) throw new Error('Invalid action data');
        else return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Post({ path: '/profile', private: true })
    protected async profileSettings(
      req: Request,
      res: Response,
      next: NextFunction,
      server: App,
    ): ResRequest {
      const { dbm } = server.locals;
      const params: Params = {
        methodQuery: 'profile_changes',
        from: 'users',
        done: true,
        status: 'OK',
      };
      try {
        const body: object = req.body;
        const queryParams: Record<string, any> = (<Record<string, any>>body).queryParams;

        if (!queryParams || _.isEmpty(queryParams)) {
          throw new Error('Invalid queryParams for profile_changes action');
        }

        const changeProfileAction = new Action.ActionParser({
          actionPath: 'users',
          actionType: 'profile_changes',
        });

        const actionParams: ActionParams = { queryParams };
        const data: ParserResult = await changeProfileAction.getActionData(actionParams);

        if (!data) throw new Error('Invalid action data');
        else return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }

    @Put({ path: '/logger', private: true })
    @Post({ path: '/logger', private: true })
    protected async logger(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const { dbm } = server.locals;
      const body = req.body;
      const actionType: string = body.actionType;
      const params: Params = {
        methodQuery: actionType,
        from: 'settingsLog',
        done: true,
        status: 'OK',
      };

      try {
        const queryParams: Record<string, any> = (<Record<string, any>>body).queryParams;

        if (!queryParams || _.isEmpty(queryParams)) {
          throw new Error('Invalid queryParams for common_changes action');
        }

        const settingsLogger = new Action.ActionParser({
          actionPath: 'settingsLog',
          actionType,
        });

        const data: ParserResult = await settingsLogger.getActionData(body);

        if (!data) throw new Error('Invalid action data');

        if (!actionType.includes('get')) return res.sendStatus(200);

        return new Responser(res, req, params, null, 200, data, dbm).emit();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        return new Responser(res, req, params, err, 503, [], dbm).emit();
      }
    }
  }
}

export default Settings;
