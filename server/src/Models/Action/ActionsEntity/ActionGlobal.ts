import { ActionParams, Actions, Action } from '../../../Utils/Interfaces';
import { ParserData } from '../../../Utils/Types';
import { files } from 'dropbox';

class ActionGlobal implements Action {
  constructor(private entity: Actions) {}

  public getEntity(): Actions {
    return this.entity;
  }

  private async loadFiles(actionParam: ActionParams): Promise<ParserData> {
    const {
      body: { queryParams = {} },
    } = actionParam as Record<string, any>;

    const entityId: string = (queryParams as Record<string, string>).entityId;
    const moduleName: string = (actionParam as Record<string, string>).moduleName;

    const path: string = `/${moduleName}/${entityId}/`;
    const files: files.ListFolderResult | null = await this.getEntity().getStore().getFilesByPath(path);
    return files;
  }

  private async deleteFile(actionParam: ActionParams): Promise<ParserData> {
    const { body: { queryParams = {} } = {}, store = '' } = actionParam as Record<string, any>;

    const file: object = (queryParams as Record<string, any>).file;
    const url: string = (file as Record<string, string>).url || '';

    const path: string = `${store}${url.split('download')[1]}` || '';
    console.log(this.getEntity().getStore());
    const deleteFile: files.DeleteResult | null = await this.getEntity().getStore().deleteFile(path);

    if (!deleteFile) return null;
    else return deleteFile;
  }

  public async download(actionParam: ActionParams): Promise<ParserData> {
    const entityId: string = (actionParam as Record<string, string>).entityId;
    const filename: string = (actionParam as Record<string, string>).filename;
    const moduleName: string = (actionParam as Record<string, string>).moduleName;

    const path: string = `/${moduleName}/${entityId}/${filename}`;

    const result = await this.getEntity().getStore().downloadFile(path);
    return result;
  }

  public async run(actionParam: ActionParams): Promise<ParserData> {
    switch (this.getEntity().getActionType()) {
      case 'load_files':
        return this.loadFiles(actionParam);
      case 'delete_file':
        return this.deleteFile(actionParam);
      case 'download_files':
        return this.download(actionParam);
      default:
        return null;
    }
  }
}

export default ActionGlobal;
