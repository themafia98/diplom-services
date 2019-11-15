import express, { Router, Request, Response } from "express";
import os from "os";
import { Server } from "http";

const coreCpuCount = os.cpus().length;
console.log("coreCpuCount:", coreCpuCount);

const app = express();
app.disabled("X-Powered-By");
const router = express.Router();

const port: string = process.env.PORT || "3001";

app.set("port", port);

const server: Server = app.listen(port, () => console.log("server start"));

const route: Router = app.use("/rest", router);

route.get("/", (request: Request, response: Response): void => {
    console.log(request);
    response.send(200);
});

export { server, app };
