import generator from 'generate-password';
import _ from 'lodash';
import { Model, Document, Types, isValidObjectId } from 'mongoose';
import {
  ActionParams,
  Actions,
  Action,
  User,
  QueryParams,
} from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import Utils from '../../../Utils/utils.global';
import { GLOBAL_ACTION_TYPE } from '../ActionEntity.global.constant';
import { ACTION_TYPE } from './ActionUsers.constant';

const { getModelByName } = Utils;

class ActionUsers implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private async getUsers(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    return this.getEntity().getAll(model, actionParam);
  }

  private async recovoryPassword(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const filed: string = (actionParam as Record<string, string>).recovoryField;
    const mode: string = (actionParam as Record<string, string>).mode;

    const props: object = mode === 'emailMode' ? { email: filed } : { login: filed };

    const result: ParserData = await this.getEntity().findOnce(model, { ...props });

    if (!result) return result;

    if (result) {
      const { _id } = (result as Record<string, string>) || {};

      const password: string = generator.generate({
        length: 10,
        numbers: true,
      });

      const passwordHash: string | null = await (result as User).changePassword(password);

      if (!passwordHash) {
        return null;
      }

      const res = await this.getEntity().updateEntity(model, {
        _id: Types.ObjectId(_id),
        updateProps: { passwordHash },
      });

      if (!res) return null;

      return password;
    }

    return null;
  }

  private async changePassword(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = {} } = actionParam as Record<string, QueryParams>;
    const { oldPassword = '', newPassword = '', uid = '' } = queryParams || {};

    const checkProps = {
      _id: Types.ObjectId(uid as string),
    };

    const result: ParserData = await this.getEntity().findOnce(model, {
      ...checkProps,
    });

    if (!result) {
      console.error('User not find for change password action');
      return null;
    }

    const isValid: boolean = await (result as User).checkPassword(oldPassword);

    if (!isValid) {
      console.error('Bad old password for change password action');
      return null;
    }

    const { _id: id } = (result as Record<string, string>) || {};
    const _id = Types.ObjectId(id);
    const password: string = newPassword;
    const passwordHash: string | null = await (result as User).changePassword(password);

    if (!passwordHash) {
      return null;
    }

    const res = await this.getEntity().updateEntity(model, { _id, updateProps: { passwordHash } });

    if (!res) return null;

    return res;
  }

  private async updateProfileChanges(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = {} } = actionParam as Record<string, QueryParams>;
    const { isHidePhone = null, isHideEmail = null, uid = '' } = queryParams || {};

    if (!uid || [isHidePhone, isHideEmail].every((type) => type === null)) {
      return null;
    }

    const _id = Types.ObjectId(uid as string);
    if (!_id) {
      console.error('Invalid user id');
      return null;
    }

    const updateProps: Record<string, boolean> = {};

    if (isHidePhone !== null) {
      updateProps.isHidePhone = isHidePhone as boolean;
    }
    if (isHideEmail !== null) {
      updateProps.isHideEmail = isHideEmail as boolean;
    }

    const res = await this.getEntity().updateEntity(model, { _id, updateProps });

    if (!res) return null;

    return res;
  }

  private async changeLanguage(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = {} } = actionParam as Record<string, QueryParams>;
    const { lang = '', uid = '' } = queryParams || {};

    if (!lang || !uid) {
      return null;
    }

    if (!isValidObjectId(uid)) {
      return null;
    }

    const updateProps: Record<string, string> = { lang };

    return await this.getEntity().updateEntity(model, { _id: Types.ObjectId(uid as string), updateProps });
  }

  private async updateCommonChanges(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const { queryParams = {} } = actionParam as Record<string, QueryParams>;
    const { newEmail = '', newPhone = '', uid = '' } = queryParams || {};

    if (!uid || (!newEmail && !newPhone)) {
      return null;
    }

    const checkProps = {
      _id: Types.ObjectId(uid as string),
    };

    const result: ParserData = await this.getEntity().findOnce(model, {
      ...checkProps,
    });

    if (!result) {
      console.error('User not find for change password action');
      return null;
    }

    const { _id: id } = (result as Record<string, string>) || {};
    const _id = Types.ObjectId(id);
    const email: string | null = newEmail || null;
    const phone: string | null = newPhone || null;

    const updateProps: Record<string, string> = {};

    if (phone !== null) updateProps.phone = phone;
    if (email !== null) updateProps.email = email;

    const res = await this.getEntity().updateEntity(model, { _id, updateProps });

    if (!res) return null;

    return res;
  }

  private async updateSingle(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    try {
      const { queryParams = {}, updateItem: updateProps = '' } = actionParam;
      const id: string = (queryParams as Record<string, string>).uid;
      const _id = Types.ObjectId(id);
      const query: ActionParams = { _id, updateProps };

      await this.getEntity().updateEntity(model, query);

      const actionData: ParserData = await this.getEntity().findOnce(model, { _id });

      return actionData;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  private async updateMany(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    /** Not supported now */
    return null;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    const model: Model<Document> | null = getModelByName('users', 'users');
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case ACTION_TYPE.GET_USERS:
        return this.getUsers(actionParam, model);
      case ACTION_TYPE.RECOVORY_PASSWORD:
        return this.recovoryPassword(actionParam, model);
      case ACTION_TYPE.CHANGE_PASSWORD:
        return this.changePassword(actionParam, model);
      case ACTION_TYPE.COMMON_SETTINGS_CHANGE:
        return this.updateCommonChanges(actionParam, model);
      case ACTION_TYPE.PROFILE_SETTINGS_CHANGE:
        return this.updateProfileChanges(actionParam, model);
      case GLOBAL_ACTION_TYPE.UPDATE_SINGLE:
        return this.updateSingle(actionParam, model);
      case ACTION_TYPE.CHANGE_LANG:
        return this.changeLanguage(actionParam, model);
      case GLOBAL_ACTION_TYPE.UPDATE_MANY:
        return this.updateMany(actionParam, model);
      default:
        return null;
    }
  }
}

export default ActionUsers;
