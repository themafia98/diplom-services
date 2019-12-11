import express, { Application, Router as RouteExpress } from "express";
import { Route } from "../../Utils/Interfaces";

namespace RouterInstance {
    export let instanceRoute: Route | null = null;

    export class Router implements Route {
        private initialization: boolean = false;
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

        get init(): boolean {
            return this.initialization;
        }

        set init(value: boolean) {
            this.initialization = value;
        }

        public getRest(): Application {
            return <Application>this.restClient;
        }

        public getEntrypoint(): Application {
            return this.entrypoint;
        }

        public initInstance(path: string): Application {
            if (this.init === false) {
                this.getEntrypoint().use(path, this.getRest());
                this.init = true;
            }
            return this.getRest();
        }

        public createRoute(path: string, flag?: string): RouteExpress {
            const newRoute: RouteExpress = express.Router();
            this.getRest().use(path, newRoute);
            return newRoute;
        }
    }
}

export default RouterInstance;
