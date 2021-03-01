import { ServiceManager, ServiceConstructor } from '../../Utils/Interfaces';

abstract class Service<T> implements ServiceManager<T> {
  private serviceConfig: object;
  private service;

  protected constructor(Service: ServiceConstructor<T>, config: object) {
    this.serviceConfig = config;
    this.service = new Service(config);
  }

  public getService(): T {
    return this.service;
  }

  public getServiceType(): string {
    return typeof this.service;
  }

  public getConfig(): object {
    return this.serviceConfig;
  }
}

export default Service;
