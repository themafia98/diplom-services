import { Application } from "express";
import { ServerRun } from "../../Utils/Interfaces";
declare class ServerRunner implements ServerRun {
    private port;
    private application;
    constructor(port: string);
    getPort(): string;
    getApp(): Application;
    setApp(express: Application): void;
    start(): void;
}
export default ServerRunner;
