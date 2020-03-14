import { NextFunction, Response, Request } from 'express';
import _ from 'lodash';
import { App, Params, ActionParams } from '../../Utils/Interfaces';
import { ParserResult, ResRequest } from '../../Utils/Types';

import Utils from '../../Utils';
import Action from '../../Models/Action';
import Decorators from '../../Decorators';

namespace Settings {
  const { getResponseJson } = Utils;

  const { Controller, Post } = Decorators;

  @Controller('/settings')
  export class SettingsController {
    @Post({ path: '/password', private: true })
    public async passwordChaged(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const params: Params = { methodQuery: 'change_password', from: 'users', done: true, status: 'OK' };
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

        if (!data) {
          throw new Error('Invalid change_password action data');
        }

        return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        if (!res.headersSent) {
          res.status(503);
          return res.json(
            getResponseJson(
              'Server error',
              { params, status: 'FAIL', done: false, metadata: [] },
              (<Record<string, any>>req).start,
            ),
          );
        }
      }
    }

    @Post({ path: '/common', private: true })
    public async commonSettings(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const params: Params = { methodQuery: 'common_changes', from: 'users', done: true, status: 'OK' };
      try {
        const body: object = req.body;
        const queryParams: Record<string, any> = (<Record<string, any>>body).queryParams;

        if (!queryParams || _.isEmpty(queryParams)) {
          throw new Error('Invalid queryParams for common_changes action');
        }

        const changePasswordAction = new Action.ActionParser({
          actionPath: 'users',
          actionType: 'common_changes',
        });

        const actionParams: ActionParams = { queryParams };
        const data: ParserResult = await changePasswordAction.getActionData(actionParams);

        if (!data) {
          throw new Error('Invalid action data');
        }

        return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        if (!res.headersSent) {
          res.status(503);
          return res.json(
            getResponseJson(
              'Server error',
              { params, status: 'FAIL', done: false, metadata: [] },
              (<Record<string, any>>req).start,
            ),
          );
        }
      }
    }

    @Post({ path: '/logger', private: true })
    async logger(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      const body = req.body;
      const actionType: string = body.actionType;
      const params: Params = { methodQuery: actionType, from: 'settingsLog', done: true, status: 'OK' };

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

        if (!data) {
          throw new Error('Invalid action data');
        }

        if (!actionType.includes('get')) return res.sendStatus(200);

        return res.json(
          getResponseJson(
            actionType,
            { done: true, status: 'OK', metadata: data, params },
            (<Record<string, any>>req).start,
          ),
        );
      } catch (err) {
        console.error(err);
        if (!res.headersSent) {
          res.status(503);
          return res.json(
            getResponseJson(
              'Server error',
              { params, status: 'FAIL', done: false, metadata: [] },
              (<Record<string, any>>req).start,
            ),
          );
        }
      }
    }
  }
}

export default Settings;
