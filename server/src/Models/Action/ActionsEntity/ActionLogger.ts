import Utils from '../../../Utils';
import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import _ from 'lodash';

const { getModelByName } = Utils;

class ActionLogger implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private async getUserSettingsLog(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = {} } = actionParam;
    return this.getEntity().getAll(model, <Record<string, any>>queryParams);
  }

  private async saveUserSettingsLog(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { item = {} } = <Record<string, any>>actionParam;
    return this.getEntity().createEntity(model, item);
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('settingsLog', 'settingsLog');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'get_user_settings_log':
        return this.getUserSettingsLog(actionParam, model);
      case 'save_user_settings_log':
        return this.saveUserSettingsLog(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionLogger;
