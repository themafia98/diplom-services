import { ACTIONS_ENTITYS_REGISTER } from './ActionRunner.constant';
import { runSyncClient, startDownloadPipe } from './ActionRunner.utils';
import { ActionParams, Runner, ActionProps, Params } from '../../Utils/Interfaces/Interfaces.global';
import ActionParser from '../ActionParser/ActionParser';
import ActionEntity from '../ActionEntity/ActionEntity';
import { parsePublicData } from '../../Utils/utils.global';
import { ParserData, ResRequest, Meta } from '../../Utils/Types/types.global';
import { files } from 'dropbox';
import Responser from '../Responser';
import { Response, Request } from 'express';
import { ParsedUrlQuery } from 'querystring';

export class ActionRunner implements Runner {
  private action: ActionEntity;

  constructor(props: ActionProps) {
    this.action = new ActionEntity(props);
  }

  public getAction(): ActionEntity {
    return this.action;
  }

  private async actionExec(actionParam: ActionParams | Meta): Promise<ParserData> {
    const parser = new ActionParser();

    if (this.getAction().getActionType() === 'sync') {
      const syncResult = await runSyncClient(parser, actionParam);
      return syncResult;
    }

    let ActionConstructor = null;

    // eslint-disable-next-line no-restricted-syntax
    for (const actionKey of Object.keys(ACTIONS_ENTITYS_REGISTER)) {
      const entityKey = this.getAction().getActionPath();

      if (actionKey === entityKey) {
        ActionConstructor = ACTIONS_ENTITYS_REGISTER[entityKey];
        break;
      }
    }

    if (ActionConstructor) {
      return new ActionConstructor(parser, this.getAction()).run(actionParam as ActionParams);
    }

    return null;
  }

  public async start(actionParam: ActionParams | Meta = {}, mode?: string, queryString?: ParsedUrlQuery) {
    const connect = await this.getAction()
      .getDbm()
      .connection()
      .catch((err: Error) => console.error(err));

    if (!connect) throw new Error('Bad connect');

    const actionResult = await this.actionExec(actionParam);

    return async (req: Request, res: Response, paramsEntity: Params, isPublic = false): ResRequest => {
      const params: Params = { ...paramsEntity };
      try {
        if (this.getAction().getActionType() === 'download_files' && actionResult) {
          const file: files.GetTemporaryLinkResult = actionResult as files.GetTemporaryLinkResult;

          return startDownloadPipe(res, file, actionParam as ActionParams) as any;
        }

        if (mode === 'exec') return actionResult as any;

        if (!actionResult) {
          params.done = false;
          params.status = 'FAIL';
          return await new Responser(res, req, params, null, 404, []).sendMessage();
        }

        let metadata: Meta = [];

        if (isPublic) {
          metadata = parsePublicData(actionResult, 'default', this.getAction().getActionPath(), queryString);
        } else metadata = actionResult;

        return await new Responser(res, req, params, null, 200, metadata).sendMessage();
      } catch (err) {
        console.error(err);
        params.status = 'FAIL';
        params.done = false;
        const responserResult = await new Responser(res, req, params, err as Error, 503, []).sendMessage();
        return responserResult;
      }
    };
  }
}

export default ActionRunner;
