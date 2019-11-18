import express, { Application, Router as RouteExpress } from "express";
import { Route } from "../../Interfaces";

namespace RouterInstance {
    export let instanceRoute: Route | null = null;

    export class Router implements Route {
        private entrypoint: Application;
        private restClient: RouteExpress = express.Router();

        constructor(app: Application) {
            this.entrypoint = app;
        }

        static instance(app: Application): Route {
            if (instanceRoute !== null) return <Route>instanceRoute;
            else {
                instanceRoute = new Router(app);
                return instanceRoute;
            }
        }

        getRest(): any | Application {
            return this.restClient;
        }

        getEntrypoint(): Application {
            return this.entrypoint;
        }

        initInstance(path: string): Application {
            this.getEntrypoint().use(path, this.restClient);
            return this.getRest();
        }

        createRoute(path: string, flag?: string): RouteExpress {
            const newRoute: RouteExpress = express.Router();
            this.restClient.use(path, newRoute);
            return newRoute;
        }
    }
}

export default RouterInstance;
