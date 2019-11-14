/// <reference types="node" />
import { Server } from "http";
declare const app: import("express-serve-static-core").Express;
declare const server: Server;
export { server, app };
