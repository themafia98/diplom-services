import { DecoratorConfig, RouteDefinition } from '../Interfaces/Interfaces.global';
import { methodDecorator } from '../Types/types.global';

export const createRestDecorator = (
  target: Record<string, any>,
  config: DecoratorConfig,
  propKey: string,
  requestMethod: methodDecorator | methodDecorator[],
) => {
  if (!Reflect.hasMetadata('routes', target.constructor)) {
    Reflect.defineMetadata('routes', [], target.constructor);
  }

  const configChunkForRoutes = {
    path: config.path,
    private: config.private,
    file: config.file || undefined,
    methodName: propKey,
  };

  const routesArray: RouteDefinition[] = Reflect.getMetadata('routes', target.constructor);

  if (Array.isArray(requestMethod)) {
    requestMethod.forEach((method) => {
      routesArray.push({
        requestMethod: method,
        ...configChunkForRoutes,
      });
    });
  } else {
    routesArray.push({
      requestMethod,
      ...configChunkForRoutes,
    });
  }

  Reflect.defineMetadata('routes', routesArray, target.constructor);
};
