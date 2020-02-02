import { NextFunction, Response, Request } from "express";
import { App, Params } from "../../../Utils/Interfaces";
import { ParserResult, Decorator } from '../../../Utils/Types';
import Utils from "../../../Utils";
import Decorators from "../../../Decorators";
import Action from "../../../Models/Action";

namespace News {
    const Controller = Decorators.Controller;
    const Post = Decorators.Post;
    const Get = Decorators.Get;

    @Controller("/news")
    export class NewsController {

    };
};

export default News;