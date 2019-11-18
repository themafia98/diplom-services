import { Application, Router as RouteExpress } from 'express';
export interface Route {
    getEntrypoint(): Application;
    initRoute(path: string, router: RouteExpress): void;
}
