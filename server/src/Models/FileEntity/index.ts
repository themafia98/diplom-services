import { FilesManager } from "../../Utils/Interfaces";

class FileEntity<T> implements FilesManager<T> {

    constructor(private service: T) { };

    public getService(): T {
        return this.service;
    }

    public changeService(service: T): void {
        this.service = service;
    }

}

export default FileEntity;