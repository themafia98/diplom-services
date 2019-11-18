import { Application, Router as RouteExpress } from 'express';
import { Route } from '../../Interfaces';
declare namespace RouterInstance {
    let instanceRoute: Route | null;
    class Router implements Route {
        private entrypoint;
        constructor(app: Application);
        static instance(app: Application): Route;
        getEntrypoint(): Application;
        static createRoute(): RouteExpress;
        initRoute(path: string, router: RouteExpress): void;
    }
}
export default RouterInstance;
