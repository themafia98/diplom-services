import express, { Application, Router as RouteExpress, application } from 'express';
import { Route } from '../../Interfaces';


namespace RouterInstance {

    export let instanceRoute: Route | null = null;

    export class Router implements Route {

        private entrypoint: Application;

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

        getEntrypoint(): Application {
            return this.entrypoint;
        }

        createRoute(path: string): RouteExpress {
            const newRoute: RouteExpress = express.Router();
            this.getEntrypoint().use(path, newRoute);
            return newRoute;
        }
    };

}


export default RouterInstance;