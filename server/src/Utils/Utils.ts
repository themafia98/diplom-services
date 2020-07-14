import path from 'path';
import _ from 'lodash';
import { NextFunction, Response, Request } from 'express';
import multer from 'multer';
import winston from 'winston';
import { model, Schema, Model, Document } from 'mongoose';
import { getSchemaByName } from '../Models/Database/Schema';
import {
  RouteDefinition,
  ResponseDocument,
  ResponseJson,
  WsWorker,
  ActionParams,
  TicketRemote,
  TaskEntity,
} from './Interfaces';
import { v4 as uuid } from 'uuid';
import { docResponse, ParserResult, Meta } from './Types';

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
    if (mode === 'equalSingle') {
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

  export const getLoggerTransports = (level: string | Array<string>): Array<object> => {
    if (Array.isArray(level)) {
      return level.map(
        (value) => new winston.transports.File({ filename: path.join('logs', `${value}.log`), level: value }),
      );
    }

    if (level === 'info') {
      return [new winston.transports.File({ filename: path.join('logs', 'info.log'), level: 'info' })];
    } else {
      return [new winston.transports.File({ filename: path.join('logs', 'error.log'), level: 'error' })];
    }
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
    return +new Date() - +startDate;
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

        if (isPrivate) middlewares.private = isPrivateRoute;
        if (isFile) middlewares.file = upload.any();
        if (isWs) middlewares.ws = wsWorkerManager;

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
            (instance as Record<string, Function>)[methodName](
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

  export const parsePublicData = (data: ParserResult, mode: string = 'default', rules = ''): Array<Meta> => {
    if (!Array.isArray(data)) return [data];
    switch (mode) {
      case 'access':
      case 'accessGroups':
        const dataArray: Array<object> = data as Array<object>;
        const isGroupMode: boolean = mode.includes('Groups');
        return dataArray
          .map((it: object | null) => {
            if (!it) return null;
            const { _doc: item = {} } = it as Record<string, object>;

            if (isGroupMode) {
              const { [mode]: modeArray = [] } = item as Record<string, Array<string>>;
              if (!Array.isArray(modeArray)) return null;

              if (modeArray.some((rule) => rule === rules)) return it;
            } else {
              if (!rules) return null;
              const { [mode]: modeStr = [] } = item as Record<string, string>;
              if (modeStr === rules) return it;
            }
            return null;
          })
          .filter(Boolean);

      default:
        return (data as Array<docResponse>)
          .map((it: docResponse) => {
            const { _doc: item = {} } = it as Record<string, object>;

            const itemValid = Object.keys(item).reduce((obj: ResponseDocument, key: string): object => {
              const addditionalRule: boolean = rules === 'users' ? !key.includes('At') : true;
              if (!key.includes('password') && !key.includes('__v') && addditionalRule) {
                obj[key] = (item as ResponseDocument)[key];
              }
              return obj;
            }, {});

            return itemValid;
          })
          .filter(Boolean);
    }
  };

  export const generateRemoteTask = (remoteDep: TicketRemote): TaskEntity => {
    const { name, lastName, other, date, phone = '-', email = '-' } = remoteDep;
    return {
      type: 'remote',
      key: uuid(),
      status: 'Открыт',
      name: `Заявка от клиента ${name} ${lastName}`,
      priority: 'Средний',
      authorName: `${name} ${lastName}`,
      uidCreater: `${uuid()}__remoteTicket`,
      editor: ['Не установлено'],
      description: other ? `${other}\n. Телефон: ${phone}, Почта: ${email}` : 'Информации нету',
      date,
      comments: [],
      offline: false,
      tags: [
        {
          color: '#e52dff',
          id: `${uuid()}__remoteTicket`,
          sortable: true,
          tagValue: 'Заявки клиентов',
        },
      ],
      additionalCreaterData: {
        email,
        phone,
      },
    };
  };

  /**
   *
   * @param actionParam contains filteredInfo: object, arrayKeys: string[]
   * @param filterId use filter with id
   * @param filterFields require: filterId. default: filter by editor or uidCreater key
   */
  export const getFilterQuery = (
    actionParam: ActionParams,
    filterId: string = '',
    filterFields: Array<object> = [{}],
  ): Record<string, Array<object>> => {
    const { saveData: { filteredInfo = {}, arrayKeys = [] } = {} } = actionParam as Record<string, any>;

    const filteredKeys: Array<string> = Object.keys(filteredInfo);
    if (!filteredKeys.length && !filterId) return {};

    if (!filteredKeys.length && filterId) {
      return {
        $or: filterFields
          ? filterFields
          : [{ editor: { $elemMatch: { $eq: filterId } } }, { uidCreater: { $eq: filterId } }],
      };
    }

    const filter: Record<string, Array<object>> = { $or: [] };

    filteredKeys.forEach((key: string) => {
      const parsedPatterns: string | Array<string> =
        Array.isArray(filteredInfo[key]) && filteredInfo[key].every((it: string) => typeof it === 'string')
          ? filteredInfo[key].map((val: string) => val.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'))
          : filteredInfo[key];

      const condtion: Readonly<Array<RegExp>> = (parsedPatterns as Array<string>).map(
        (pattern: string) => new RegExp(pattern, 'gi'),
      );
      const query = !arrayKeys.some((arrKey: string) => key === arrKey)
        ? { [key]: { $in: condtion } }
        : { [key]: { $elemMatch: { $in: condtion } } };

      if (key && condtion) filter.$or.push(query);
    });

    if (filterId) {
      filter.$and = [];

      filter.$and.push({
        $or: filterFields
          ? filterFields
          : [{ editor: { $elemMatch: { $eq: filterId } } }, { uidCreater: { $eq: filterId } }],
      });
    }

    return !filter['$or'].length ? { $or: [{}] } : filter;
  };

  /** @deprecated 01.06.2020 should use mongoose isValidObjectId */
  export const isValidObjectId = (id: string): boolean => {
    return !!id && typeof id === 'string' && id.length <= 24;
  };
}

export default Utils;
