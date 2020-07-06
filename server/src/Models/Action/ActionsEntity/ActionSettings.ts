import Utils from '../../../Utils';
import { v4 as uuid } from 'uuid';
import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import _ from 'lodash';

const { getModelByName } = Utils;

class ActionSettings implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
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

      await this.getEntity().updateEntity(model, query, { upsert: true });
      const actionData: ParserData = await this.getEntity().findOnce(model, queryFind);
      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private async getStatusList(model: Model<Document>, actionParam: ActionParams): Promise<ParserData> {
    const result = await this.getEntity().getAll(model, {});
    return result;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('settings', 'settings');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'get_statusList':
        return this.getStatusList(model, actionParam);
      case 'change_statusList':
        return this.onChangeStatusList(model, actionParam);
      default:
        return null;
    }
  }
}

export default ActionSettings;
