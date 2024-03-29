import { Response, Request } from 'express';
import { Params, ActionParams, QueryParams } from '../../Utils/Interfaces/Interfaces.global';
import { ResRequest } from '../../Utils/Types/types.global';
import { Controller, Post, Put, Get } from '../../Utils/decorators/Decorators';
import { createParams } from '../Controllers.utils';
import { SETTINGS_ROUTE } from './Settings.path';
import ActionRunner from '../../Models/ActionRunner/ActionRunner';
import { ENTITY } from '../../Models/Database/Schema/Schema.constant';
import { getVersion } from '../../Utils/utils.global';

@Controller('/settings')
class SettingsController {
  static version = getVersion();

  @Post({ path: SETTINGS_ROUTE[SettingsController.version].CHANGE_PASSWORD, private: true })
  protected async passwordChanged(req: Request, res: Response): ResRequest {
    const params: Params = createParams('change_password', 'done', ENTITY.USERS);

    const { body } = req;
    const { queryParams } = body as Record<string, QueryParams>;

    const changePasswordAction = new ActionRunner({
      actionPath: ENTITY.USERS,
      actionType: 'change_password',
      body,
    });

    const actionParams: ActionParams = { queryParams };

    const responseExec = await changePasswordAction.start(actionParams);
    return responseExec(req, res, params);
  }

  @Get({ path: SETTINGS_ROUTE[SettingsController.version].LOAD_STATUS_LIST, private: true })
  @Put({ path: SETTINGS_ROUTE[SettingsController.version].LOAD_STATUS_LIST, private: true })
  protected async statusList(req: Request, res: Response): ResRequest {
    const isGetter = req.method === 'GET';

    const params: Params = createParams(
      isGetter ? 'get_statusList' : 'change_settings',
      'done',
      ENTITY.SETTINGS,
    );

    const { body } = req;
    const { params: queryParams = {} } = body as Record<string, QueryParams>;
    const { items = [], query = '' } = queryParams;

    const changeStatusList = new ActionRunner({
      actionPath: ENTITY.SETTINGS,
      actionType: isGetter ? 'get_statusList' : 'change_settings',
    });

    const actionParams: ActionParams = !isGetter ? { items, idSettings: query } : {};

    const responseExec = await changeStatusList.start(actionParams);
    return responseExec(req, res, params);
  }

  @Put({ path: SETTINGS_ROUTE[SettingsController.version].LOAD_TASKS_PRIORITY, private: true })
  @Get({ path: SETTINGS_ROUTE[SettingsController.version].LOAD_TASKS_PRIORITY, private: true })
  protected async loadTasksPriority(req: Request, res: Response): ResRequest {
    const isGetter = req.method === 'GET';

    const params: Params = createParams(
      isGetter ? 'get_tasksPriority' : 'change_settings',
      'done',
      ENTITY.SETTINGS,
    );

    const loadTasksPriority = new ActionRunner({
      actionPath: ENTITY.SETTINGS,
      actionType: isGetter ? 'get_tasksPriority' : 'change_settings',
    });

    const { body } = req;
    const { params: queryParams = {} } = body as Record<string, QueryParams>;
    const { items = [], query = '' } = queryParams;

    const actionParams: ActionParams = !isGetter ? { items, idSettings: query } : {};

    const responseExec = await loadTasksPriority.start(actionParams);
    return responseExec(req, res, params);
  }

  @Post({ path: SETTINGS_ROUTE[SettingsController.version].SAVE_COMMON, private: true })
  protected async commonSettings(req: Request, res: Response): ResRequest {
    const params: Params = createParams('common_changes', 'done', ENTITY.USERS);

    const { body } = req;
    const { queryParams } = body;

    const changeCommonAction = new ActionRunner({
      actionPath: ENTITY.USERS,
      actionType: 'common_changes',
    });

    const actionParams: ActionParams = { queryParams };

    const responseExec = await changeCommonAction.start(actionParams);
    return responseExec(req, res, params);
  }

  @Post({ path: SETTINGS_ROUTE[SettingsController.version].SAVE_LANGUAGE, private: true })
  protected async saveLanguage(req: Request, res: Response): ResRequest {
    const params: Params = createParams('change_language', 'done', ENTITY.USERS);

    const { params: bodyParams = null } = req.body;

    const { options: queryParams } = bodyParams as Record<string, QueryParams>;

    const changeLangAction = new ActionRunner({
      actionPath: ENTITY.USERS,
      actionType: 'change_language',
    });

    const actionParams: ActionParams = { queryParams };

    const responseExec = await changeLangAction.start(actionParams);
    return responseExec(req, res, params);
  }

  @Post({ path: SETTINGS_ROUTE[SettingsController.version].SAVE_PROFILE, private: true })
  protected async profileSettings(req: Request, res: Response): ResRequest {
    const params: Params = createParams('profile_changes', 'done', ENTITY.USERS);
    const { body } = req;

    const { queryParams } = body;

    const changeProfileAction = new ActionRunner({
      actionPath: ENTITY.USERS,
      actionType: 'profile_changes',
    });

    const actionParams: ActionParams = { queryParams };

    const responseExec = await changeProfileAction.start(actionParams);
    return responseExec(req, res, params);
  }

  @Put({ path: SETTINGS_ROUTE[SettingsController.version].SAVE_LOGS, private: true })
  @Post({ path: '/logger', private: true })
  protected async logger(req: Request, res: Response): ResRequest {
    const { body } = req;
    const { actionType = '' } = body;

    const params: Params = createParams(actionType as string, 'done', ENTITY.SETTINGS_LOGS);

    const settingsLogger = new ActionRunner({
      actionPath: ENTITY.SETTINGS_LOGS,
      actionType: actionType as string,
    });
    const responseExec = await settingsLogger.start(body);
    return responseExec(req, res, params);
  }
}

export default SettingsController;
