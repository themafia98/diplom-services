import { NextFunction, Response, Request } from "express";
import { ServerRun } from "../../Utils/Interfaces";
import { App, Params, FileApi } from "../../Utils/Interfaces";
import { ParserResult, ResRequest } from "../../Utils/Types";
import Decorators from "../../Decorators";

namespace Contact {
    const { Controller, Get } = Decorators;

    @Controller("/contact")
    export class ContactGlobal {
        @Get({ path: "/global", private: true })
        async getNewsList(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
            return res.sendStatus(200);
        }
    }
}

export default Contact;
