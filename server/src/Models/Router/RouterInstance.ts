import express, { Application, Router as RouteExpress } from 'express';
import { Route } from '../../Utils/Interfaces/Interfaces.global';

let instanceRoute: Route | null = null;

export class Router implements Route {
  private initialization = false;

  private readonly entrypoint: Application;

  private restClient: RouteExpress = express.Router();

  constructor(app: Application) {
    this.entrypoint = app;
  }

  static instance(app: Application): Route {
    if (instanceRoute !== null) return instanceRoute as Route;

    instanceRoute = new Router(app);
    return instanceRoute;
  }

  get init(): boolean {
    return this.initialization;
  }

  set init(value: boolean) {
    this.initialization = value;
  }

  public getRest(): Application {
    return this.restClient as Application;
  }

  public getEntrypoint(): Application {
    return this.entrypoint;
  }

  public initInstance(path: string): Application {
    if (!this.init) {
      this.getEntrypoint().use(path, this.getRest());
      this.init = true;
    }
    return this.getRest();
  }

  public createRoute(path: string): RouteExpress {
    const newRoute: RouteExpress = express.Router();
    this.getRest().use(path, newRoute);
    return newRoute;
  }
}
