import { Response, Request } from 'express';
import _ from 'lodash';
import {
  Params,
  ActionParams,
  Controller as ControllerApi,
  QueryParams,
} from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';

import Action from '../../Models/Action';
import Decorators from '../../Utils/decorators';
import { createParams } from '../Controllers.utils';

namespace Settings {
  const { Controller, Post, Put, Get } = Decorators;

  @Controller('/settings')
  export class SettingsController implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/password', private: true })
    protected async passwordChanged(req: Request, res: Response): ResRequest {
      const params: Params = createParams('change_password', 'done', 'users');

      const body: Record<string, object> = req.body;
      const { queryParams } = body as Record<string, QueryParams>;

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

      const params: Params = createParams(
        isGetter ? 'get_statusList' : 'change_statusList',
        'done',
        'settings',
      );

      const body: Record<string, object> = req.body;
      const { params: queryParams = {} } = body as Record<string, QueryParams>;
      const { items = [], query = '' } = queryParams;

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
      const params: Params = createParams('common_changes', 'done', 'users');

      const body: Record<string, QueryParams> = req.body;
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
      const params: Params = createParams('profile_changes', 'done', 'users');
      const body: Record<string, QueryParams> = req.body;

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

      const params: Params = createParams(actionType as string, 'done', 'settingsLog');

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
