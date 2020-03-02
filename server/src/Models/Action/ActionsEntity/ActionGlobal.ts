import { ActionParams, Actions } from "../../../Utils/Interfaces";
import { ParserData } from "../../../Utils/Types";
import { files } from "dropbox";

class ActionGlobal {
    constructor(private entity: Actions) {}

    getEntity(): Actions {
        return this.entity;
    }

    public async run(actionParam: ActionParams): ParserData {
        if (this.getEntity().getActionType() === "load_files") {
            const {
                body: { queryParams = {} }
            } = <Record<string, any>>actionParam;

            const entityId: string = (queryParams as Record<string, string>).entityId;
            const moduleName: string = (actionParam as Record<string, string>).moduleName;

            const path: string = `/${moduleName}/${entityId}/`;
            const files: files.ListFolderResult | null = await this.getEntity()
                .getStore()
                .getFilesByPath(path);
            return files;
        }

        if (this.getEntity().getActionType() === "delete_file") {
            const { body: { queryParams = {} } = {}, store = "" } = <Record<string, any>>actionParam;

            const file: object = (queryParams as Record<string, any>).file;
            const url: string = (file as Record<string, string>).url || "";

            const path: string = `${store}${url.split("download")[1]}` || "";

            console.log("path delete:", path);

            const deleteFile: files.DeleteResult | null = await this.getEntity()
                .getStore()
                .deleteFile(path);

            if (!deleteFile) return null;
            else return deleteFile;
        }

        if (this.getEntity().getActionType() === "download_files") {
            const entityId: string = (actionParam as Record<string, string>).entityId;
            const filename: string = (actionParam as Record<string, string>).filename;
            const moduleName: string = (actionParam as Record<string, string>).moduleName;

            const path: string = `/${moduleName}/${entityId}/${filename}`;

            const file: files.FileMetadata | null = await this.getEntity()
                .getStore()
                .downloadFile(path);
            return file;
        }

        return null;
    }
}

export default ActionGlobal;
