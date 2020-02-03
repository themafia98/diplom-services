import { DropboxApi, DropboxAccess, DownloadDropbox, UploadDropbox } from "../Utils/Interfaces";
import { Dropbox, files } from 'dropbox';

/**
 * 
 * Remote service Dropbox module
 */
namespace DropboxStorage {

    export class DropboxManager implements DropboxApi {

        /**
         * Dropbox api object
         */
        private dbx: Dropbox;

        /**
         * 
         * @param props init with dropbox api token
         */
        constructor(props: DropboxAccess) {
            this.dbx = new Dropbox({ fetch: require("isomorphic-fetch"), accessToken: props.token });
        }

        /**
         * @return {Dropbox} dbx object
         */
        public getDbx(): Dropbox {
            return this.dbx;
        }

        /**
         * @return {files.ListFolderResult} all files list in application store
         */
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

        /**
         * 
         * @param {string} path files by path
         */
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

        /**
         * 
         * @param saveProps props for save file in application store
         * @param {string} path  prop in saveProps, file path for save
         * @param {Buffer} cotents - binary file object for save
         */
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

        /**
         * @param props for download file from application store
         * @param {string} moduleName - module dir name
         * @param {string} filename - download filename
         * @param {string} ext - extension downloading file
         */
        public async downloadFile(fileProps: DownloadDropbox): Promise<files.FileMetadata | null> {
            try {
                const { moduleName = "", filename = "", ext = "", cardName = "" } = fileProps;

                const path = !cardName ? `/${moduleName}/${filename}.${ext}` : `/${moduleName}/${cardName}/${filename}.${ext}`;
                const response = await this.getDbx().filesDownload({ path });
                return response;
            } catch (err) {
                console.error(err);
                return null;
            }
        }
    }
}

export default DropboxStorage;