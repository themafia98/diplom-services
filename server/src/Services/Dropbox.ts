import { DropboxApi, DropboxAccess, DownloadDropbox, UploadDropbox } from "../Utils/Interfaces";
import { Dropbox, files } from 'dropbox';

namespace DropboxStorage {

    export class DropboxManager implements DropboxApi {

        private dbx: Dropbox;

        constructor(props: DropboxAccess) {
            this.dbx = new Dropbox({ fetch: require("isomorphic-fetch"), accessToken: props.token });
        }

        public getDbx(): Dropbox {
            return this.dbx;
        }

        public async getAllFiles(): Promise<files.ListFolderResult | null> {
            try {
                const response = await this.getDbx().filesListFolder({ path: '' });

                if (!response) throw new Error("Bad connect to dropbox");

                return response;
            } catch (err) {
                console.error(err);
                return null;
            }
        }

        public async getFilesByPath(path: string): Promise<files.ListFolderResult | null> {
            try {
                const response = await this.getDbx().filesListFolder({ path });

                if (!response) throw new Error("Bad connect to dropbox");

                return response;
            } catch (err) {
                console.error(err);
                return null;
            }
        }

        public async saveFile(saveProps: UploadDropbox): Promise<files.FileMetadata | null> {
            try {
                const { path, contents } = saveProps;
                const response = await this.getDbx().filesUpload({
                    path,
                    contents,
                });
                return response;
            } catch (err) {
                console.error(err);
                return null;
            }
        }

        public async downloadFile(fileProps: DownloadDropbox): Promise<files.FileMetadata | null> {
            try {
                const { moduleName = "", filename = "", ext = "", cardName = "" } = fileProps;

                const realpath = !cardName ? `${moduleName}/${filename}.${ext}` : `${moduleName}/${cardName}/${filename}.${ext}`;
                const response = await this.getDbx().filesDownload({ "path": realpath });
                return response;
            } catch (err) {
                console.error(err);
                return null;
            }

        }
    }
}

export default DropboxStorage;