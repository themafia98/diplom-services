import { NextFunction, Response, Request } from 'express';
import multer from 'multer';
import winston from 'winston';
import { model, Schema, Model, Document } from 'mongoose';
import _ from 'lodash';
import { getSchemaByName } from '../Models/Database/Schema';
import {
  RouteDefinition,
  ResponseDocument,
  ResponseJson,
  WsWorker,
  ActionParams,
  Params,
  Dbms,
} from './Interfaces';
import { FileTransportInstance, docResponse, ParserResult } from './Types';

namespace Utils {
  const upload = multer();

  /**
   * @returns {boolean} current process is production or not
   */
  export const isProd = (): boolean => {
    return process.env.NODE_ENV === 'production';
  };

  export const checkEntity = async (
    mode: string,
    checkKey: string,
    actionParam: ActionParams,
    model: Model<Document>,
  ): Promise<boolean> => {
    if (mode == 'equalSingle') {
      let query = {};

      const field: any = actionParam[checkKey];
      const type: string = (actionParam as Record<string, string>).type;

      if (Array.isArray(field)) {
        query = { [checkKey]: { $in: field } };
      }

      query = { type, [checkKey]: field };

      console.log(query);

      const result = await model.find(query);
      console.log('query checker:', query);

      if (Array.isArray(result) && result.length) {
        return false;
      }
    }
    return true;
  };

  export const getLoggerTransports = (
    level: string,
  ): Array<FileTransportInstance> | FileTransportInstance => {
    if (level === 'info') {
      return [new winston.transports.File({ filename: 'info.log', level: 'info' })];
    } else return new winston.transports.File({ filename: 'error.log', level: 'error' });
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

  export const responseTime = (startDate: Date): number => {
    const now: number = Number(_.toString(new Date()));
    const start: number = Number(_.toString(startDate));
    return now - start;
  };

  export const initControllers = (
    controllers: Array<FunctionConstructor>,
    getApp: Function,
    getRest: Function,
    isPrivateRoute: Function,
    wsWorkerManager: WsWorker,
  ) => {
    controllers.forEach((Controller: FunctionConstructor) => {
      // This is our instantiated class
      const instance: object = new Controller();
      const prefix = Reflect.getMetadata('prefix', Controller);
      // Our `routes` array containing all our routes for this controller
      const routes: Array<RouteDefinition> = Reflect.getMetadata('routes', Controller);

      // Iterate over all routes and register them to our express application
      routes.forEach((route) => {
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
          prefix === '/' ? route.path : prefix + route.path,
          ...compose,
          (req: Request, res: Response, next: NextFunction) => {
            const { methodName } = route;
            (<Record<string, Function>>instance)[methodName](
              req,
              res,
              next,
              getApp(),
              isWs ? wsWorkerManager : null,
            );
          },
        );
      });
    });
  };

  export const getResponseJson = (
    actionString: string,
    response: ResponseJson<object | null | number>,
    start: Date,
  ): object => {
    return {
      action: actionString,
      response,
      uptime: process.uptime(),
      responseTime: responseTime(start),
    };
  };

  /** @deprecated 18.04.20 */
  export const responser = async (
    res: Response,
    req: Request,
    params: Params,
    err: Error | null,
    status: number = 200,
    metadata: ParserResult = null,
    dbm: Dbms | null = null,
  ): Promise<Response> => {
    console.warn('deprecated responser, use new Responser class');
    if (res.headersSent) return res;
    if (status) res.status(status);
    if (dbm) await dbm.disconnect().catch((err: Error) => console.error(err));

    switch (status) {
      case 200:
        return res.json(
          getResponseJson(
            params?.methodQuery,
            { params, metadata, done: true, status: 'OK' },
            (<Record<string, any>>req).start,
          ),
        );
      case 503:
        return res.json(
          getResponseJson(
            (<Error>err)?.name,
            { metadata: 'Server error', params, done: false, status: 'FAIL' },
            (req as Record<string, any>).start,
          ),
        );
      default:
        return res.json(
          getResponseJson(
            `error or status not connected to responser, ${params?.methodQuery}`,
            { status: params?.status, params, done: false, metadata },
            (req as Record<string, any>).start,
          ),
        );
    }
  };

  export const isImage = (buffer: Buffer): boolean => {
    if (!buffer || buffer.length < 8) {
      return false;
    }

    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  };

  export const parsePublicData = (
    data: ParserResult,
    mode: string = 'default',
    rules = '',
  ): ArrayLike<object> => {
    switch (mode) {
      case 'access':
      case 'accessGroups':
        const isGroupMode = mode.includes('Groups');
        return (<docResponse[]>data)
          .map((it: docResponse) => {
            const item: ResponseDocument = it['_doc'] || it;

            if (isGroupMode) {
              if (!Array.isArray(item[mode])) return null;

              const accept: Array<string> = <Array<string>>item[mode] || [];

              if (accept.some((rule) => rule === rules)) return it;
            } else {
              if (!rules) return null;

              const accept: string = <string>item[mode];
              if (accept === rules) return it;
            }
            return null;
          })
          .filter(Boolean);

      default:
        return (<docResponse[]>data)
          .map((it: docResponse) => {
            const item: ResponseDocument = it['_doc'] || it;

            const itemValid = Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
              if (!key.includes('password') && !key.includes('At') && !key.includes('__v')) {
                obj[key] = item[key];
              }
              return obj;
            }, {});

            return itemValid;
          })
          .filter(Boolean);
    }
  };
}

export default Utils;
