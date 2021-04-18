import { getModelByName } from '../../../Utils/utils.global';
import { Model, Document } from 'mongoose';
import { ActionParams, Action, QueryParams, Parser } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import { ACTION_TYPE } from './ActionLogger.constant';
import ActionEntity from '../../ActionEntity/ActionEntity';
import { ENTITY } from '../../Database/Schema/Schema.constant';

class ActionLogger implements Action {
  private entityParser: Parser;
  private entity: ActionEntity;

  constructor(entityParser: Parser, entity: ActionEntity) {
    this.entityParser = entityParser;
    this.entity = entity;
  }

  public getEntityParser(): Parser {
    return this.entityParser;
  }

  public getEntity(): ActionEntity {
    return this.entity;
  }

  private async getUserSettingsLog(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = {} } = actionParam as Record<string, QueryParams>;
    return this.getEntityParser().getAll(model, queryParams);
  }

  private async saveUserSettingsLog(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { item = {} } = actionParam as Record<string, any>;
    return this.getEntityParser().createEntity(model, item);
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName(ENTITY.SETTINGS_LOGS, ENTITY.SETTINGS_LOGS);
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
