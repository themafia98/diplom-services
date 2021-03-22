import Utils from '../../../Utils/utils.global';
import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action, QueryParams } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import { ACTION_TYPE } from './ActionLogger.constant';

const { getModelByName } = Utils;

class ActionLogger implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private async getUserSettingsLog(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = {} } = actionParam as Record<string, QueryParams>;
    return this.getEntity().getAll(model, queryParams);
  }

  private async saveUserSettingsLog(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { item = {} } = actionParam as Record<string, any>;
    return this.getEntity().createEntity(model, item);
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('settingsLog', 'settingsLog');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case ACTION_TYPE.GET_SETTINGS_LOGS:
        return this.getUserSettingsLog(actionParam, model);
      case ACTION_TYPE.SAVE_SETTINGS_LOGS:
        return this.saveUserSettingsLog(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionLogger;
