import { Application, Router as RouteExpress } from 'express';

export interface Route {
    getEntrypoint(): Application,
    createRoute(path: string): RouteExpress,
}