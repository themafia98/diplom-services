import { ActionParams, Action, QueryParams, Parser } from '../../../Utils/Interfaces/Interfaces.global';
import path from 'path';
import { ParserData } from '../../../Utils/Types/types.global';
import { files } from 'dropbox';
import { ACTION_TYPE } from './ActionGlobal.constant';
import ActionEntity from '../../ActionEntity/ActionEntity';

class ActionGlobal implements Action {
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

  private async loadFiles(actionParam: ActionParams): Promise<ParserData> {
    const { body = {} } = actionParam as Record<string, object>;

    const { queryParams = {} } = body as Record<string, QueryParams>;
    const { entityId } = queryParams;

    const moduleName: string = (actionParam as Record<string, string>).moduleName;

    const pathFile: string = `/${moduleName}/${entityId}/`;

    return await this.getEntity().getStore().getFilesByPath(pathFile);
  }

  private async deleteFile(actionParam: ActionParams): Promise<ParserData> {
    const { body = {}, store = '' } = actionParam as Record<string, object | string>;

    const { queryParams = {} } = body as Record<string, QueryParams>;

    const { file = {} } = queryParams;

    const url: string = file.url || '';

    const pathFile: string = `${store}${url.split('download')[1]}` || '';

    const deleteFile: files.DeleteResult | null = await this.getEntity().getStore().deleteFile(pathFile);

    if (!deleteFile) return null;
    else return deleteFile;
  }

  public async download(actionParam: ActionParams): Promise<ParserData> {
    const entityId: string = (actionParam as Record<string, string>).entityId;
    const filename: string = (actionParam as Record<string, string>).filename;
    const moduleName: string = (actionParam as Record<string, string>).moduleName;

    const pathFile: string = `/${moduleName}/${entityId}/${filename}`;

    return await this.getEntity().getStore().downloadFile(pathFile);
  }

  private async saveFile(actionParam: ActionParams): Promise<ParserData> {
    const { files = [], moduleName = '' } = actionParam as Record<string, Array<any>>;
    let responseSave: Array<object> = [];
    for await (let file of files) {
      const [filename, entityId] = file.fieldname.split('_$FT$P$_');
      const ext = path.extname(file.originalname);

      const pathFile: string = `/${moduleName}/${entityId}/${file.originalname}`;
      const result = await this.getEntity().getStore().saveFile({ path: pathFile, contents: file.buffer });

      if (result) {
        responseSave.push({
          name: result.name,
          isSave: true,
        });
      } else {
        responseSave.push({
          name: `${filename}.${ext.replace('.', '')}`,
          isSave: false,
        });
      }
    }

    return responseSave;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    switch (this.getEntity().getActionType()) {
      case ACTION_TYPE.LOAD_FILES:
        return this.loadFiles(actionParam);
      case ACTION_TYPE.DELETE_FILE:
        return this.deleteFile(actionParam);
      case ACTION_TYPE.DOWNLOAD_FILES:
        return this.download(actionParam);
      case ACTION_TYPE.SAVE_FILE:
        return this.saveFile(actionParam);
      default:
        return null;
    }
  }
}

export default ActionGlobal;
