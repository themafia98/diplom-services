import { Response, Request } from 'express';
import _ from 'lodash';
import { Params, ActionParams, Controller as ControllerApi } from '../../Utils/Interfaces';
import { ResRequest } from '../../Utils/Types';

import Action from '../../Models/Action';
import Decorators from '../../Decorators';

namespace Settings {
  const { Controller, Post, Put, Get } = Decorators;

  @Controller('/settings')
  export class SettingsController implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/password', private: true })
    protected async passwordChanged(req: Request, res: Response): ResRequest {
      const params: Params = {
        methodQuery: 'change_password',
        from: 'users',
        done: true,
        status: 'OK',
      };

      const body: Record<string, object> = req.body;
      const { queryParams } = body;

      const changePasswordAction = new Action.ActionParser({
        actionPath: 'users',
        actionType: 'change_password',
        body,
      });

      const actionParams: ActionParams = { queryParams };

      const responseExec: Function = await changePasswordAction.actionsRunner(actionParams);
      return responseExec(req, res, params);
    }

    @Get({ path: '/statusList', private: true })
    @Put({ path: '/statusList', private: true })
    protected async statusList(req: Request, res: Response): ResRequest {
      const isGetter = req.method === 'GET';

      const params: Params = {
        methodQuery: isGetter ? 'get_statusList' : 'change_statusList',
        from: 'settings',
        done: true,
        status: 'OK',
      };

      const body: Record<string, object> = req.body;
      const { params: queryParams = {} } = body as Record<string, object>;
      const { items = [], query = '' } = queryParams as Record<string, Array<object>>;

      const changeStatusList = new Action.ActionParser({
        actionPath: 'settings',
        actionType: isGetter ? 'get_statusList' : 'change_statusList',
      });

      const actionParams: ActionParams = !isGetter ? { items, idSettings: query } : {};

      const responseExec: Function = await changeStatusList.actionsRunner(actionParams);
      return responseExec(req, res, params);
    }

    @Post({ path: '/common', private: true })
    protected async commonSettings(req: Request, res: Response): ResRequest {
      const params: Params = {
        methodQuery: 'common_changes',
        from: 'users',
        done: true,
        status: 'OK',
      };

      const body: Record<string, object> = req.body;
      const { queryParams } = body;

      const changeCommonAction = new Action.ActionParser({
        actionPath: 'users',
        actionType: 'common_changes',
      });

      const actionParams: ActionParams = { queryParams };

      const responseExec: Function = await changeCommonAction.actionsRunner(actionParams);
      return responseExec(req, res, params);
    }

    @Post({ path: '/profile', private: true })
    protected async profileSettings(req: Request, res: Response): ResRequest {
      const params: Params = {
        methodQuery: 'profile_changes',
        from: 'users',
        done: true,
        status: 'OK',
      };

      const body: Record<string, object> = req.body;
      const { queryParams } = body;

      const changeProfileAction = new Action.ActionParser({
        actionPath: 'users',
        actionType: 'profile_changes',
      });

      const actionParams: ActionParams = { queryParams };

      const responseExec: Function = await changeProfileAction.actionsRunner(actionParams);
      return responseExec(req, res, params);
    }

    @Put({ path: '/logger', private: true })
    @Post({ path: '/logger', private: true })
    protected async logger(req: Request, res: Response): ResRequest {
      const body: Record<string, object | string> = req.body;
      const { actionType = '' } = body;

      const params: Params = {
        methodQuery: actionType as string,
        from: 'settingsLog',
        done: true,
        status: 'OK',
      };

      const settingsLogger = new Action.ActionParser({
        actionPath: 'settingsLog',
        actionType: actionType as string,
      });
      const responseExec: Function = await settingsLogger.actionsRunner(body);
      return responseExec(req, res, params);
    }
  }
}

export default Settings;
