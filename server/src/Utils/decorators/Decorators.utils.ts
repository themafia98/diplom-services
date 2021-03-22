import { DecoratorConfig, RouteDefinition } from '../Interfaces/Interfaces.global';
import { methodDecorator } from '../Types/types.global';

export const createRestDecorator = (
  target: object,
  config: DecoratorConfig,
  propKey: string,
  requestMethod: methodDecorator,
) => {
  if (!Reflect.hasMetadata('routes', target.constructor)) {
    Reflect.defineMetadata('routes', [], target.constructor);
  }

  const routesArray: RouteDefinition[] = Reflect.getMetadata('routes', target.constructor);

  routesArray.push({
    requestMethod,
    path: config.path,
    private: config.private,
    file: config.file || undefined,
    methodName: propKey,
  });

  Reflect.defineMetadata('routes', routesArray, target.constructor);
};
