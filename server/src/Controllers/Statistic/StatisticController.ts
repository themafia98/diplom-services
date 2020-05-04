import { Router as RouteExpress } from 'express';
import { ServerRun } from '../../Utils/Interfaces';

namespace Statistic {
  export const module = (app: ServerRun, route: RouteExpress): null | void => {
    if (!app) return null;

    route.get('/list', (req, res) => {
      res.sendStatus(200);
    });
  };
}

export default Statistic;
