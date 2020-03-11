import { NextFunction } from "express";
import multer from "multer";
import winston from "winston";
import { model, Schema, Model, Document } from "mongoose";
import { getSchemaByName } from "../Models/Database/Schema";
import { RouteDefinition, ResponseDocument, ResponseJson, WsWorker, ActionParams } from "./Interfaces";
import { FileTransportInstance, docResponse, ParserResult } from "./Types";

namespace Utils {
    const upload = multer();

    export const checkEntity = async (
        mode: string,
        checkKey: string,
        actionParam: ActionParams,
        model: Model<Document>
    ): Promise<boolean> => {
        if (mode == "equalSingle") {
            let query = {};

            const field: any = actionParam[checkKey];
            const type: string = (actionParam as Record<string, string>).type;

            if (Array.isArray(field)) {
                query = { [checkKey]: { $in: field } };
            }

            query = { type, [checkKey]: field };

            console.log(query);

            const result = await model.find(query);
            console.log("query checker:", query);

            if (Array.isArray(result) && result.length) {
                return false;
            }
        }
        return true;
    };

    export const getLoggerTransports = (level: string): Array<FileTransportInstance> | FileTransportInstance => {
        if (level === "info") {
            return [new winston.transports.File({ filename: "info.log", level: "info" })];
        } else return new winston.transports.File({ filename: "error.log", level: "error" });
    };

    export const getModelByName = (name: string, schemaType: string): Model<Document, {}> | null => {
        try {
            const schema: Schema | null = getSchemaByName(schemaType);

            if (schema) return model(name, schema);
            else return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    export const responseTime = (start: Date) => {
        return <any>new Date() - <any>start;
    };

    export const initControllers = (
        controllers: Array<any>,
        getApp: Function,
        getRest: Function,
        isPrivateRoute: Function,
        wsWorkerManager: WsWorker
    ) => {
        controllers.forEach(controller => {
            // This is our instantiated class
            const instance: Record<string, any> = new controller();
            const prefix = Reflect.getMetadata("prefix", controller);
            // Our `routes` array containing all our routes for this controller
            const routes: Array<RouteDefinition> = Reflect.getMetadata("routes", controller);

            // Iterate over all routes and register them to our express application
            routes.forEach(route => {
                const isWs = route.ws;
                const isFile = route.file;
                const isPrivate = route.private;

                const middlewares: Record<string, object> = {};

                isPrivate ? (middlewares.private = isPrivateRoute) : null;
                isFile ? (middlewares.file = upload.any()) : null;
                isWs ? (middlewares.ws = wsWorkerManager) : null;

                const compose: Readonly<Array<object | null>> = Object.keys(middlewares)
                    .map((key: string) => {
                        if (middlewares[key]) {
                            return middlewares[key];
                        } else return null;
                    })
                    .filter(Boolean);

                getRest()[route.requestMethod](
                    prefix === "/" ? route.path : prefix + route.path,
                    ...compose,
                    (req: Request, res: Response, next: NextFunction) => {
                        instance[route.methodName](req, res, next, getApp(), isWs ? wsWorkerManager : null);
                    }
                );
            });
        });
    };

    export const getResponseJson = (
        actionString: string,
        response: ResponseJson<object | null>,
        start: Date
    ): object => {
        return {
            action: actionString,
            response,
            uptime: process.uptime(),
            responseTime: responseTime(start),
        };
    };

    export const isImage = (buffer: Buffer): boolean => {
        if (!buffer || buffer.length < 8) {
            return false;
        }

        return (
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4E &&
            buffer[3] === 0x47 &&
            buffer[4] === 0x0D &&
            buffer[5] === 0x0A &&
            buffer[6] === 0x1A &&
            buffer[7] === 0x0A
        );
    };

    export const parsePublicData = (data: ParserResult): ArrayLike<object> =>
        (<docResponse[]>data)
            .map((it: docResponse) => {
                const item: ResponseDocument = it["_doc"] || it;

                const itemValid = Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
                    if (!key.includes("password") && !key.includes("At") && !key.includes("__v")) {
                        obj[key] = item[key];
                    }
                    return obj;
                }, {});

                return itemValid;
            })
            .filter(Boolean);
}

export default Utils;
