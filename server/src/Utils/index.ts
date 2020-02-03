import { NextFunction } from 'express';
import multer from 'multer';
import winston from "winston";
import { model, Schema, Model, Document } from 'mongoose';
import { getSchemaByName } from '../Models/Database/Schema';
import { RouteDefinition, ResponseDocument } from './Interfaces';
import { FileTransportInstance, docResponse, ParserResult } from "./Types";

namespace Utils {

    const upload = multer();

    export const getLoggerTransports = (level: string): Array<FileTransportInstance> | FileTransportInstance => {
        if (level === "info") {
            return [new winston.transports.File({ filename: "info.log", level: "info" })];
        } else return new winston.transports.File({ filename: "error.log", level: "error" });
    };

    export const getModelByName = (name: string, schemaType: string): Model<Document, {}> | null => {
        try {
            const schema: Schema | null = getSchemaByName(schemaType);
            console.log(name);
            if (schema) return model(name, schema);
            else return null;

        } catch (err) {

            console.error(err);
            return null;
        }
    }

    export const responseTime = (start: Date) => {
        return <any>new Date() - <any>start;
    }

    export const initControllers = (controllers: Array<any>,
        getApp: Function, getRest: Function, isPrivateRoute: Function) => {
        controllers.forEach(controller => {
            // This is our instantiated class
            const instance: any = new controller();
            const prefix = Reflect.getMetadata('prefix', controller);
            // Our `routes` array containing all our routes for this controller
            const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', controller);

            // Iterate over all routes and register them to our express application 
            routes.forEach(route => {


                if (!route.file) {

                    if (!route.private) {
                        getRest()[route.requestMethod](prefix === "/" ? route.path : prefix + route.path,
                            (req: Request, res: Response, next: NextFunction) => {
                                instance[route.methodName](req, res, next, getApp());
                            });
                    }
                    else {
                        getRest()[route.requestMethod](prefix === "/" ? route.path : prefix + route.path,
                            isPrivateRoute,
                            (req: Request, res: Response, next: NextFunction) => {
                                // Execute our method for this path and pass our express
                                // request and response object.
                                instance[route.methodName](req, res, next, getApp());
                            });
                    }
                } else {

                    if (!route.private) {
                        getRest()[route.requestMethod](prefix === "/" ? route.path : prefix + route.path,
                            upload.any(),
                            (req: Request, res: Response, next: NextFunction) => {
                                instance[route.methodName](req, res, next, getApp());
                            });
                    }
                    else {
                        getRest()[route.requestMethod](prefix === "/" ? route.path : prefix + route.path,
                            upload.any(), isPrivateRoute,
                            (req: Request, res: Response, next: NextFunction) => {
                                // Execute our method for this path and pass our express
                                // request and response object.
                                instance[route.methodName](req, res, next, getApp());
                            });
                    }
                }
            });
        });
    }


    export const parsePublicData = (data: ParserResult): ArrayLike<object> => (<docResponse[]>data)
        .map((it: docResponse) => {
            const item: ResponseDocument = it["_doc"] || it;

            const itemValid = Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
                if (!key.includes("password") && !key.includes("At") && !key.includes("__v")) {
                    obj[key] = item[key];
                }
                return obj;
            }, {});

            return itemValid;
        }).filter(Boolean);
}

export default Utils;
