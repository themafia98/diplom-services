import generator from 'generate-password';
import _ from 'lodash';
import { Model, Document, Types, isValidObjectId } from 'mongoose';
import { ActionParams, Action, User, QueryParams, Parser } from '../../../Utils/Interfaces/Interfaces.global';
import { ParserData } from '../../../Utils/Types/types.global';
import { getModelByName } from '../../../Utils/utils.global';
import ActionEntity from '../../ActionEntity/ActionEntity';
import { ENTITY } from '../../Database/Schema/Schema.constant';
import { GLOBAL_ACTION_TYPE } from '../ActionEntity.global.constant';
import { ACTION_TYPE } from './ActionUsers.constant';

class ActionUsers implements Action {
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

  private async getUsers(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    return this.getEntityParser().getAll(model, actionParam);
  }

  private async verifyRecovory(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const email: string = (actionParam as Record<string, string>).recovoryField;
    const result: ParserData = await this.getEntityParser().findOnce(model, { email });

    if (!result) {
      return result;
    }

    const { _id: userId } = (result as Record<string, string>) || {};

    if (!isValidObjectId(userId)) {
      return null;
    }

    const tokenModel: Model<Document> | null = getModelByName(ENTITY.RECOVERY_TOKEN, ENTITY.RECOVERY_TOKEN);

    if (tokenModel === null) {
      return null;
    }

    return await tokenModel.create({ userId } as object);
  }

  private async recovoryPassword(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    const recovoryToken: string = (actionParam as Record<string, string>).recovoryToken;
    const to: string = (actionParam as Record<string, string>).to;

    const tokenModel = getModelByName(ENTITY.RECOVERY_TOKEN, ENTITY.RECOVERY_TOKEN);

    if (!tokenModel) {
      throw new Error('bad token model for recovory');
    }

    const tokenForRecovoryPassword = await tokenModel.findById(Types.ObjectId(recovoryToken));

    if (!tokenForRecovoryPassword) {
      console.error('tokenForRecovoryPassword not found');
      return null;
    }

    const { userId = '' } = (tokenForRecovoryPassword as any) || {};

    const result: ParserData = await this.getEntityParser().findOnce(model, {
      _id: Types.ObjectId(userId),
      email: to,
    });

    if (!result) {
      return result;
    }

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

      const res = await this.getEntityParser().updateEntity(model, {
        _id: Types.ObjectId(_id),
        updateProps: { passwordHash },
      });

      if (!res) return null;

      await tokenModel.findByIdAndDelete(Types.ObjectId(recovoryToken));

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

    const result: ParserData = await this.getEntityParser().findOnce(model, {
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

    const res = await this.getEntityParser().updateEntity(model, { _id, updateProps: { passwordHash } });

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

    const res = await this.getEntityParser().updateEntity(model, { _id, updateProps });

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

    return await this.getEntityParser().updateEntity(model, {
      _id: Types.ObjectId(uid as string),
      updateProps,
    });
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

    const result: ParserData = await this.getEntityParser().findOnce(model, {
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

    const res = await this.getEntityParser().updateEntity(model, { _id, updateProps });

    if (!res) return null;

    return res;
  }

  private async updateSingle(actionParam: ActionParams, model: Model<Document>): Promise<ParserData> {
    try {
      const { queryParams = {}, updateItem: updateProps = '' } = actionParam;
      const id: string = (queryParams as Record<string, string>).uid;
      const _id = Types.ObjectId(id);
      const query: ActionParams = { _id, updateProps };

      await this.getEntityParser().updateEntity(model, query);

      const actionData: ParserData = await this.getEntityParser().findOnce(model, { _id });

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
    const model: Model<Document> | null = getModelByName(ENTITY.USERS, ENTITY.USERS);
    if (!model) return null;

    switch (this.getEntity().getActionType()) {
      case ACTION_TYPE.GET_USERS:
        return this.getUsers(actionParam, model);
      case ACTION_TYPE.RECOVORY_PASSWORD:
        return this.recovoryPassword(actionParam, model);
      case ACTION_TYPE.RECOVORY_PASSWORD_TOKEN:
        return this.verifyRecovory(actionParam, model);
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
