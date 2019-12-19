import { Application, Router as RouteExpress } from "express";
import { Route } from "../../Utils/Interfaces";
declare namespace RouterInstance {
    let instanceRoute: Route | null;
    class Router implements Route {
        private initialization;
        private entrypoint;
        private restClient;
        constructor(app: Application);
        static instance(app: Application): Route;
        init: boolean;
        getRest(): Application;
        getEntrypoint(): Application;
        initInstance(path: string): Application;
        createRoute(path: string, flag?: string): RouteExpress;
    }
}
export default RouterInstance;
