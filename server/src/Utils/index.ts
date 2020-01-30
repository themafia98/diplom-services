import { NextFunction } from 'express';
import winston from "winston";
import { model, Schema, Model, Document } from 'mongoose';
import { getSchemaByName } from '../Models/Database/Schema';
import { RouteDefinition } from './Interfaces';
import { FileTransportInstance, schemaConfig } from "./Types";
import Tasks from '../Controllers/Tasks';

namespace Utils {
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
            });
        });
    }
}

export default Utils;
