import { Decorator } from '../Utils/Types';
import { RouteDefinition } from '../Utils/Interfaces';
/** Decorator @Controller */

namespace Decorators {

    export const Controller = (prefix: string): Decorator => (target: Object): void => {
        Reflect.defineMetadata("prefix", prefix, target);
        if (!Reflect.hasMetadata("routes", target)) {
            Reflect.defineMetadata("routes", [], target);
        }
    }

    export const Get = (path: string): Decorator => (target: object, propKey: string | undefined): void => {
        if (!Reflect.hasMetadata("routes", target.constructor)) {
            Reflect.defineMetadata("routes", [], target.constructor);
        }

        const routesArray: RouteDefinition[] = Reflect.getMetadata("routes", target.constructor);

        routesArray.push({
            requestMethod: "get",
            path,
            methodName: <string>propKey
        });

        Reflect.defineMetadata("routes", routesArray, target.constructor);
    }
}


export default Decorators;