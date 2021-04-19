import { ServiceManager, ServiceConstructor } from '../../Utils/Interfaces/Interfaces.global';

abstract class Service<T> implements ServiceManager<T> {
  private serviceConfig: Record<string, any>;

  private service;

  protected constructor(ServiceConstr: ServiceConstructor<T>, config: Record<string, any>) {
    this.serviceConfig = config;
    this.service = new ServiceConstr(config);
  }

  public getService(): T {
    return this.service;
  }

  public getServiceType(): string {
    return typeof this.service;
  }

  public getConfig(): Record<string, any> {
    return this.serviceConfig;
  }
}

export default Service;
