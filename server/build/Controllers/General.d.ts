import { Router as RouteExpress } from "express";
import { App } from "../Utils/Interfaces";
declare namespace General {
    const module: (app: App, route: RouteExpress) => void;
}
export default General;
