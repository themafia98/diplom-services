import { DropboxAccess, FileApi } from '../Utils/Interfaces';
import { Dropbox, files } from 'dropbox';
import { FileMetadata, ListFolderResult } from '../Utils/Types';
import Service from '../Models/Service';

/**
 *
 * Remote service Dropbox module
 */
namespace DropboxStorage {
  export class DropboxManager extends Service<Dropbox> implements FileApi {
    /**
     * @param props init service
     */
    constructor(props: DropboxAccess) {
      super(
        new Dropbox({
          fetch: require('isomorphic-fetch'),
          accessToken: props.token,
        }),
      );
    }

    /**
     * @return {files.ListFolderResult} all files list in application store
     */
    public async getAllFiles(): Promise<ListFolderResult | null> {
      try {
        const result = await this.getService().filesListFolder({ path: '' });
        if (result as files.ListFolderResult) return result;
        else return null;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    /**
     * Delete file im application store
     */
    public async deleteFile(path: string): Promise<files.DeleteResult | null> {
      try {
        const result: files.DeleteResult = await this.getService().filesDeleteV2({ path });
        if (result as files.DeleteResult) return result;
        else return null;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    /**
     *
     * @param {string} path files by path
     */
    public async getFilesByPath(path: string): Promise<files.ListFolderResult | null> {
      try {
        const response = await this.getService().filesListFolder({ path });

        if (!response) throw new Error('Bad connect to dropbox');

        return response;
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    /**
     *
     * @param saveProps props for save file in application store
     * @param {string} path  prop in saveProps, file path for save
     * @param {Buffer} cotents - binary file object for save
     */
    public async saveFile<UploadDropbox>(saveProps: UploadDropbox): Promise<FileMetadata | null> {
      try {
        const path: string = (saveProps as Record<string, any>).path;
        const contents: Buffer = (saveProps as Record<string, any>).contents;

        return await this.getService().filesUpload({
          path,
          contents,
        });
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    /**
     * @param fileProps
     */
    public async downloadFileByProps<DownloadDropbox>(fileProps: DownloadDropbox): Promise<FileMetadata> {
      try {
        const { moduleName = '', filename = '', cardName = '', ext = '' } = fileProps as Record<string, any>;

        const path: string = !cardName
          ? `/${moduleName}/${filename}.${ext}`
          : `/${moduleName}/${cardName}/${filename}.${ext}`;
        return await this.getService().filesDownload({ path });
      } catch (err) {
        console.error(err);
        return null;
      }
    }

    /**
     * Download file by url address
     * @param path file url
     */
    public async downloadFile(path: string): Promise<files.GetTemporaryLinkResult | null> {
      try {
        return await this.getService().filesGetTemporaryLink({
          path,
        });
      } catch (err) {
        console.error(err);
        return null;
      }
    }
  }
}

export default DropboxStorage;
