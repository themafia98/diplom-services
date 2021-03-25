import Utils from '../../../Utils/utils.global';
import { v4 as uuid } from 'uuid';
import { Model, Document } from 'mongoose';
import { ActionParams, Action, Parser } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import _ from 'lodash';
import { ACTION_TYPE } from './ActionSettings.constant';
import ActionEntity from '../../ActionEntity/ActionEntity';
import { ENTITY } from '../../Database/Schema/Schema.constant';

const { getModelByName } = Utils;

class ActionSettings implements Action {
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

  private async onChangeStatusList(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    try {
      const { items: draftItems = [] } = actionParam as Record<string, Array<Record<string, string>>>;
      const { idSettings = '' } = actionParam as Record<string, string>;

      const settings: Array<Record<string, string>> = draftItems.map((item) => {
        const { id: idItem, value, active = false } = item as Record<string, any>;
        if (item && typeof idItem === 'string' && idItem.includes('virtual')) {
          return {
            id: uuid(),
            value,
            active,
          };
        }

        return item && typeof item === 'object' ? { id: idItem, value, active } : item;
      });

      const updateProps = {
        idSettings,
        settings,
      };

      const queryFind: ActionParams = { idSettings };
      const query: ActionParams = { idSettings, updateProps, customQuery: 'idSettings' };

      await this.getEntityParser().updateEntity(model, query, { upsert: true });
      const actionData: ParserData = await this.getEntityParser().findOnce(model, queryFind);
      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private async getStatusList(model: Model<Document>): Promise<ParserData> {
    return await this.getEntityParser().getAll(model, { idSettings: 'statusSettings' });
  }

  private async loadTasksPriority(model: Model<Document>): Promise<ParserData> {
    return await this.getEntityParser().getAll(model, { idSettings: 'tasksPriority' });
    // return ['Высокий', 'Средний', 'Низкий', 'Критический'];
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName(ENTITY.SETTINGS, ENTITY.SETTINGS);
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case ACTION_TYPE.GET_STATUS_LIST:
        return this.getStatusList(model);
      case ACTION_TYPE.CHANGE_SETINGS:
        return this.onChangeStatusList(model, actionParam);
      case ACTION_TYPE.LOAD_TASKS_PRIORITY:
        return this.loadTasksPriority(model);
      default:
        return null;
    }
  }
}

export default ActionSettings;
