import { ServiceManager } from "../../Utils/Interfaces";

abstract class Service<T> implements ServiceManager<T> {

    constructor(private service: T) { };

    public getService(): T {
        return this.service;
    }

    public changeService(service: T): void {
        this.service = service;
    }

}

export default Service;