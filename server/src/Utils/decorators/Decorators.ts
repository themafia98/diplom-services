import { Decorator } from '../Types/types.global';
import { RouteDefinition, DecoratorConfig } from '../Interfaces/Interfaces.global';

namespace Decorators {
  export const Controller = (prefix: string): Decorator => (target: Object): void => {
    // target - class
    Reflect.defineMetadata('prefix', prefix, target);
    if (!Reflect.hasMetadata('routes', target)) {
      Reflect.defineMetadata('routes', [], target);
    }
  };

  export const Get = (config: DecoratorConfig): Decorator => (
    target: object,
    propKey: string | undefined,
  ): void => {
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    const routesArray: RouteDefinition[] = Reflect.getMetadata('routes', target.constructor);

    routesArray.push({
      requestMethod: 'get',
      path: config.path,
      private: config.private,
      file: config.file || undefined,
      methodName: propKey as string,
    });

    Reflect.defineMetadata('routes', routesArray, target.constructor);
  };

  export const Post = (config: DecoratorConfig): Decorator => (
    target: object,
    propKey: string | undefined,
  ): void => {
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    const routesArray: RouteDefinition[] = Reflect.getMetadata('routes', target.constructor);

    routesArray.push({
      requestMethod: 'post',
      path: config.path,
      private: config.private,
      file: config.file || undefined,
      methodName: propKey as string,
    });

    Reflect.defineMetadata('routes', routesArray, target.constructor);
  };

  export const Delete = (config: DecoratorConfig): Decorator => (
    target: object,
    propKey: string | undefined,
  ): void => {
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    const routesArray: RouteDefinition[] = Reflect.getMetadata('routes', target.constructor);

    routesArray.push({
      requestMethod: 'delete',
      path: config.path,
      private: config.private,
      file: config.file || undefined,
      methodName: propKey as string,
    });

    Reflect.defineMetadata('routes', routesArray, target.constructor);
  };

  export const Put = (config: DecoratorConfig): Decorator => (
    target: object,
    propKey: string | undefined,
  ): void => {
    if (!Reflect.hasMetadata('routes', target.constructor)) {
      Reflect.defineMetadata('routes', [], target.constructor);
    }

    const routesArray: RouteDefinition[] = Reflect.getMetadata('routes', target.constructor);

    routesArray.push({
      requestMethod: 'put',
      path: config.path,
      private: config.private,
      file: config.file || undefined,
      methodName: propKey as string,
    });

    Reflect.defineMetadata('routes', routesArray, target.constructor);
  };
}

export default Decorators;
