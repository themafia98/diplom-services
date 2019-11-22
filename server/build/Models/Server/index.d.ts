import { Application } from "express";
import { ServerRun } from "../../Interfaces";
declare class ServerRunner implements ServerRun {
    private port;
    private application;
    constructor(port: string);
    getApp(): Application;
    setApp(express: Application): void;
    start(): void;
}
export default ServerRunner;