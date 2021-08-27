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
    const { body = {} } = actionParam as Record<string, Record<string, any>>;

    const { queryParams = {} } = body as Record<string, QueryParams>;
    const { entityId } = queryParams;

    const { moduleName } = actionParam as Record<string, string>;

    const pathFile = `/${moduleName}/${entityId}/`;

    const filesResult = await this.getEntity().getStore().getFilesByPath(pathFile);
    return filesResult;
  }

  private async deleteFile(actionParam: ActionParams): Promise<ParserData> {
    const { body = {}, store = '' } = actionParam as Record<string, Record<string, any> | string>;

    const { queryParams = {} } = body as Record<string, QueryParams>;

    const { file = {} } = queryParams;

    const url: string = file.url || '';

    const pathFile: string = `${store}${url.split('download')[1]}` || '';

    const deleteFile: files.DeleteResult | null = await this.getEntity().getStore().deleteFile(pathFile);

    if (!deleteFile) return null;
    return deleteFile;
  }

  public async download(actionParam: ActionParams): Promise<ParserData> {
    const { entityId } = actionParam as Record<string, string>;
    const { filename } = actionParam as Record<string, string>;
    const { moduleName } = actionParam as Record<string, string>;

    const pathFile = `/${moduleName}/${entityId}/${filename}`;

    const downloadResult = await this.getEntity().getStore().downloadFile(pathFile);
    return downloadResult;
  }

  private async saveFile(actionParam: ActionParams): Promise<ParserData> {
    const { files: filesList = [], moduleName = '' } = actionParam as Record<string, Array<any>>;
    const responseSave: Array<Record<string, any>> = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const file of filesList) {
      const [filename, entityId] = file.fieldname.split('_$FT$P$_');
      const ext = path.extname(file.originalname);

      const pathFile = `/${moduleName}/${entityId}/${file.originalname}`;
      const result = await this.getEntity().getStore().saveFile({ path: pathFile, contents: file.buffer });

      if (result) {
        responseSave.push({
          // @ts-ignore
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
