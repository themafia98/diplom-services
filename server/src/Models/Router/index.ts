import express, { Application, Router as RouteExpress } from "express";
import { Route } from "../../Interfaces";

namespace RouterInstance {
    export let instanceRoute: Route | null = null;

    export class Router implements Route {
        private initialization: boolean = false;
        private entrypoint: Application;
        private restClient: RouteExpress = express.Router();

        constructor(app: Application) {
            this.entrypoint = app;
        }

        get init(): boolean {
            return this.initialization;
        }

        set init(value: boolean) {
            this.initialization = value;
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
            if (this.init === false) {
                this.getEntrypoint().use(path, this.restClient);
                this.init = true;
            }
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
