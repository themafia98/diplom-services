import { Response, Request } from 'express';
import _ from 'lodash';
import {
  Params,
  ActionParams,
  Controller as ControllerApi,
  QueryParams,
} from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';
import Decorators from '../../Utils/decorators';
import { createParams } from '../Controllers.utils';
import { SETTINGS_ROUTE } from './Settings.path';
import Utils from '../../Utils/utils.global';
import ActionRunner from '../../Models/ActionRunner/ActionRunner';
import { ENTITY } from '../../Models/Database/Schema/Schema.constant';

namespace Settings {
  const { Controller, Post, Put, Get } = Decorators;

  @Controller('/settings')
  export class SettingsController implements ControllerApi<FunctionConstructor> {
    @Post({ path: SETTINGS_ROUTE[Utils.getVersion()].CHANGE_PASSWORD, private: true })
    protected async passwordChanged(req: Request, res: Response): ResRequest {
      const params: Params = createParams('change_password', 'done', ENTITY.USERS);

      const body: Record<string, object> = req.body;
      const { queryParams } = body as Record<string, QueryParams>;

      const changePasswordAction = new ActionRunner({
        actionPath: ENTITY.USERS,
        actionType: 'change_password',
        body,
      });

      const actionParams: ActionParams = { queryParams };

      const responseExec: Function = await changePasswordAction.start(actionParams);
      return responseExec(req, res, params);
    }

    @Get({ path: SETTINGS_ROUTE[Utils.getVersion()].LOAD_STATUS_LIST, private: true })
    @Put({ path: SETTINGS_ROUTE[Utils.getVersion()].LOAD_STATUS_LIST, private: true })
    protected async statusList(req: Request, res: Response): ResRequest {
      const isGetter = req.method === 'GET';

      const params: Params = createParams(
        isGetter ? 'get_statusList' : 'change_statusList',
        'done',
        ENTITY.SETTINGS,
      );

      const body: Record<string, object> = req.body;
      const { params: queryParams = {} } = body as Record<string, QueryParams>;
      const { items = [], query = '' } = queryParams;

      const changeStatusList = new ActionRunner({
        actionPath: ENTITY.SETTINGS,
        actionType: isGetter ? 'get_statusList' : 'change_statusList',
      });

      const actionParams: ActionParams = !isGetter ? { items, idSettings: query } : {};

      const responseExec: Function = await changeStatusList.start(actionParams);
      return responseExec(req, res, params);
    }

    @Get({ path: SETTINGS_ROUTE[Utils.getVersion()].LOAD_TASKS_PRIORITY, private: true })
    protected async loadTasksPriority(req: Request, res: Response): ResRequest {
      const params: Params = createParams('get_tasksPriority', 'done', ENTITY.SETTINGS);

      const loadTasksPriority = new ActionRunner({
        actionPath: ENTITY.SETTINGS,
        actionType: 'get_tasksPriority',
      });

      const responseExec: Function = await loadTasksPriority.start({});
      return responseExec(req, res, params);
    }

    @Post({ path: SETTINGS_ROUTE[Utils.getVersion()].SAVE_COMMON, private: true })
    protected async commonSettings(req: Request, res: Response): ResRequest {
      const params: Params = createParams('common_changes', 'done', ENTITY.USERS);

      const body: Record<string, QueryParams> = req.body;
      const { queryParams } = body;

      const changeCommonAction = new ActionRunner({
        actionPath: ENTITY.USERS,
        actionType: 'common_changes',
      });

      const actionParams: ActionParams = { queryParams };

      const responseExec: Function = await changeCommonAction.start(actionParams);
      return responseExec(req, res, params);
    }

    @Post({ path: SETTINGS_ROUTE[Utils.getVersion()].SAVE_LANGUAGE, private: true })
    protected async saveLanguage(req: Request, res: Response): ResRequest {
      const params: Params = createParams('change_language', 'done', ENTITY.USERS);

      const { params: bodyParams = null } = req.body;

      const { options: queryParams } = bodyParams as Record<string, QueryParams>;

      const changeLangAction = new ActionRunner({
        actionPath: ENTITY.USERS,
        actionType: 'change_language',
      });

      const actionParams: ActionParams = { queryParams };

      const responseExec: Function = await changeLangAction.start(actionParams);
      return responseExec(req, res, params);
    }

    @Post({ path: SETTINGS_ROUTE[Utils.getVersion()].SAVE_PROFILE, private: true })
    protected async profileSettings(req: Request, res: Response): ResRequest {
      const params: Params = createParams('profile_changes', 'done', ENTITY.USERS);
      const body: Record<string, QueryParams> = req.body;

      const { queryParams } = body;

      const changeProfileAction = new ActionRunner({
        actionPath: ENTITY.USERS,
        actionType: 'profile_changes',
      });

      const actionParams: ActionParams = { queryParams };

      const responseExec: Function = await changeProfileAction.start(actionParams);
      return responseExec(req, res, params);
    }

    @Put({ path: SETTINGS_ROUTE[Utils.getVersion()].SAVE_LOGS, private: true })
    @Post({ path: '/logger', private: true })
    protected async logger(req: Request, res: Response): ResRequest {
      const body: Record<string, object | string> = req.body;
      const { actionType = '' } = body;

      const params: Params = createParams(actionType as string, 'done', ENTITY.SETTINGS_LOGS);

      const settingsLogger = new ActionRunner({
        actionPath: ENTITY.SETTINGS_LOGS,
        actionType: actionType as string,
      });
      const responseExec: Function = await settingsLogger.start(body);
      return responseExec(req, res, params);
    }
  }
}

export default Settings;
