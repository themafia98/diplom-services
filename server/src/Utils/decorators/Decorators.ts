import { Decorator, methodDecorator } from '../Types/types.global';
import { DecoratorConfig } from '../Interfaces/Interfaces.global';
import { createRestDecorator } from './Decorators.utils';

export const Controller = (prefix: string): Decorator => (target: Object): void => {
  Reflect.defineMetadata('prefix', prefix, target);
  if (!Reflect.hasMetadata('routes', target)) {
    Reflect.defineMetadata('routes', [], target);
  }
};

export const Any = (config: DecoratorConfig): Decorator => (
  target: object,
  propKey: string | undefined,
): void => {
  const anyMethodsList: Array<methodDecorator> = ['get', 'post', 'delete', 'put'];

  createRestDecorator(target, config, propKey as string, anyMethodsList);
};

export const Get = (config: DecoratorConfig): Decorator => (
  target: object,
  propKey: string | undefined,
): void => {
  createRestDecorator(target, config, propKey as string, 'get');
};

export const Post = (config: DecoratorConfig): Decorator => (
  target: object,
  propKey: string | undefined,
): void => {
  createRestDecorator(target, config, propKey as string, 'post');
};

export const Delete = (config: DecoratorConfig): Decorator => (
  target: object,
  propKey: string | undefined,
): void => {
  createRestDecorator(target, config, propKey as string, 'delete');
};

export const Put = (config: DecoratorConfig): Decorator => (
  target: object,
  propKey: string | undefined,
): void => {
  createRestDecorator(target, config, propKey as string, 'put');
};
