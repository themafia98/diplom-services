import { Router as RouteExpress } from 'express';
import { App } from '../../Utils/Interfaces';
declare namespace Tasks {
    const module: (app: App, route: RouteExpress) => void | null;
}
export default Tasks;
