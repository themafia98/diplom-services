import generator from 'generate-password';
import _ from 'lodash';
import { Model, Document } from 'mongoose';
import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import Utils from '../../../Utils';

const { getModelByName } = Utils;

class ActionUsers implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private async getUsers(actionParam: ActionParams, model: Model<Document>): ParserData {
    return this.getEntity().getAll(model, actionParam);
  }

  private async recovoryPassword(actionParam: ActionParams, model: Model<Document>): ParserData {
    const filed: string = (<Record<string, string>>actionParam).recovoryField;
    const mode: string = (<Record<string, string>>actionParam).mode;

    const props: object = mode == 'emailMode' ? { email: filed } : { login: filed };

    const result: Record<string, any> | null = await this.getEntity().findOnce(model, { ...props });

    if (!result) return result;

    if (<Record<string, any>>result) {
      const { _id } = result || {};

      const password: string = generator.generate({
        length: 10,
        numbers: true,
      });

      const passwordHash: string | null = await result.changePassword(password);

      if (!passwordHash) {
        return null;
      }

      const res = await this.getEntity().updateEntity(model, { _id, updateProps: { passwordHash } });

      if (!res) return null;

      return <any>password;
    }

    return null;
  }

  private async changePassword(actionParam: ActionParams, model: Model<Document>): ParserData {
    const { queryParams = {} } = ({} = <Record<string, any>>actionParam);
    const { oldPassword = '', newPassword = '', uid = '' } = queryParams || {};

    const checkProps = {
      _id: uid,
    };

    const result: Record<string, any> | null = await this.getEntity().findOnce(model, { ...checkProps });

    if (!result) {
      console.error('User not find for change password action');
      return null;
    }

    const isValid: boolean = await result.checkPassword(oldPassword);

    if (!isValid) {
      console.error('Bad old password for change password action');
      return null;
    }

    const { _id } = result || {};

    const password: string = newPassword;
    const passwordHash: string | null = await result.changePassword(password);

    if (!passwordHash) {
      return null;
    }

    const res = await this.getEntity().updateEntity(model, { _id, updateProps: { passwordHash } });

    if (!res) return null;

    return res;
  }

  private async updateCommonChanges(actionParam: ActionParams, model: Model<Document>): ParserData {
    const { queryParams = {} } = ({} = <Record<string, any>>actionParam);
    const { newEmail = '', newPhone = '', uid = '' } = queryParams || {};

    if (!uid || (!newEmail && !newPhone)) {
      return null;
    }

    const checkProps = {
      _id: uid,
    };

    const result: Record<string, any> | null = await this.getEntity().findOnce(model, { ...checkProps });

    if (!result) {
      console.error('User not find for change password action');
      return null;
    }

    const { _id } = result || {};

    const email: string = newEmail ? newEmail : null;
    const phone: string = newPhone ? newPhone : null;

    const updateProps: Record<string, string> = {};

    if (!_.isNull(phone)) updateProps.phone = phone;
    if (!_.isNull(email)) updateProps.email = email;

    const res = await this.getEntity().updateEntity(model, { _id, updateProps });

    if (!res) return null;

    return res;
  }

  private async updateSingle(actionParam: ActionParams, model: Model<Document>): ParserData {
    try {
      const { queryParams = {}, updateItem: updateProps = '' } = actionParam;
      const _id: string = (queryParams as Record<string, string>).uid;

      const query: ActionParams = { _id, updateProps };

      await this.getEntity().updateEntity(model, query);

      const actionData: Document = await this.getEntity().findOnce(model, { _id });

      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private async updateMany(actionParam: ActionParams, model: Model<Document>): ParserData {
    /** Not supported now */
    return null;
  }

  public async run(actionParam: ActionParams): ParserData {
    const model: Model<Document> | null = getModelByName('users', 'users');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case 'get_all':
        return this.getUsers(actionParam, model);
      case 'recovory_checker':
        return this.recovoryPassword(actionParam, model);
      case 'change_password':
        return this.changePassword(actionParam, model);
      case 'common_changes':
        return this.updateCommonChanges(actionParam, model);
      case 'update_single':
        return this.updateSingle(actionParam, model);
      case 'update_many':
        return this.updateMany(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionUsers;
