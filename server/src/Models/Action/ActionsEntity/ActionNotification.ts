import Utils from '../../../Utils';
import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import _ from 'lodash';

const { getModelByName } = Utils;

class ActionNotification implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  public runGlobal(actionParam: ActionParams, model: Model<Document>): any {
    const actionType: string = this.getEntity().getActionType();
    const { methodQuery = {} } = <Record<string, object>>actionParam;
    if (actionType.includes('set')) {
      const { item = null } = <Record<string, object>>actionParam;

      console.log('action item:', item);

      if (!item) return null;

      return this.getEntity().createEntity(model, item);
    }

    console.log('additionalQuery:', methodQuery);

    return this.getEntity().getAll(model, { type: 'global', ...methodQuery });
  }

  public runMass(actionParam: ActionParams, model: Model<Document>): any {}

  public async run(actionParam: ActionParams): ParserData {
    const model: Model<Document> | null = getModelByName('notification', 'notification');
    if (!model) return null;

    const { item: { type = 'global' } = {} } = <Record<string, any>>actionParam;

    switch (type) {
      case 'global': {
        return this.runGlobal(actionParam, model);
      }
      case 'mass': {
        return this.runMass(actionParam, model);
      }
      default: {
        return null;
      }
    }
  }
}

export default ActionNotification;
