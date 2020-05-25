import _ from 'lodash';
import { Rest } from '../../Utils/Interfaces';
import { Application } from 'express';

abstract class RestEntitiy implements Rest {
  private readonly port: string;
  private rest: Application | undefined;
  private application: null | Application = null;

  constructor(port: string) {
    this.port = port;
  }

  public getPort(): string {
    return this.port;
  }

  public getRest(): Application {
    return this.rest as Application;
  }

  public setRest(route: Application): void {
    if (!this.rest) {
      this.rest = route;
    }
  }

  public getApp(): Application {
    return this.application as Application;
  }

  public setApp(express: Application): void {
    if (_.isNull(this.application)) this.application = express;
  }
}

export default RestEntitiy;
