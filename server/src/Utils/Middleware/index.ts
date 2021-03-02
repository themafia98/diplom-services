import { Response, NextFunction, Request } from 'express';
import passport from 'passport';
import * as passportLocal from 'passport-local';
import { Dbms, User } from '../Interfaces';
import { UserModel } from '../../Models/Database/Schema';
import { ObjectId } from 'mongodb';

import url from 'url';
import querystring from 'querystring';
import { Types } from 'mongoose';
import AccessRole from '../../Models/AccessRole';
import { ACTIONS_ACCESS } from '../../app.constant';

namespace Middleware {
  const LocalStrategy = passportLocal.Strategy;

  export const timer = (req: Request, res: Response, next: NextFunction): void => {
    (<any>req).start = new Date();
    next();
  };

  export const securityChecker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const request = req as Record<string, any>;

    const { query } = url.parse(request.url);
    const { uid = '' } = querystring.parse(query as string);

    const { session = null } = request as Record<string, null | object | AccessRole>;

    if (session && request.session.access && request.body) {
      request.session.availableActions = AccessRole.getAvailableActions(
        request.body.moduleName || '',
        request.session.access,
      );
    }

    const { actionType = '' } = req.body;

    if ((<string>actionType).toUpperCase().includes(ACTIONS_ACCESS.CREATE) && request.session) {
      request.shouldBeCreate = request.session.availableActions.some(
        (it: string) => it === ACTIONS_ACCESS.CREATE,
      );
    }

    if (!uid) {
      next();
      return;
    }

    request.uid = Types.ObjectId(uid as string);
    next();
  };

  export const catchError = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    // set locals, only providing error in development
    console.error(err);

    next();
  };

  export const jsonWebTokenRegister = (dbm: Dbms): void => {
    passport.use(
      new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
        },
        async (email: string, password: string, done: Function): Promise<Function> => {
          /** auth */
          try {
            const connect = await dbm.connection();
            if (!connect) throw new Error('Bad connect');
            const result = await UserModel.findOne({ email });
            if (!result) {
              await dbm.disconnect().catch((err: Error) => console.error(err));
            }
            const userResult: User = (await UserModel.findOne({ email })) as User;
            if (!userResult) {
              await dbm.disconnect().catch((err: Error) => console.error(err));
              return done(userResult);
            }

            if (!(await userResult.checkPassword(password))) {
              return done(null, false, {
                message: 'Нет такого пользователя или пароль неверен.',
              });
            }
            return done(null, userResult);
          } catch (err) {
            console.error(err);
            return done(err);
          }
        },
      ),
    );
    passport.serializeUser((user: Record<string, ObjectId>, done: Function): void => {
      /** save cookie sesson */
      const { id } = user || {};
      done(null, id);
    });

    passport.deserializeUser(
      async (id: string, done: Function): Promise<void | Function> => {
        /** clear cookie session */
        try {
          const connect = await dbm.connection();
          if (!connect) throw new Error('Bad connect');
          const result = await UserModel.findById(id);
          if (!result) {
            await dbm.disconnect().catch((err: Error) => console.error(err));
            console.log('deserializeUser error');
          }
          done(null, result);
        } catch (err) {
          console.error(err);
          return done(err, null);
        }
      },
    );
  };

  export const checkPrivateRoute = (req: Request, res: Response, next: NextFunction): Response | void => {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.clearCookie('connect.sid');
      return res.sendStatus(503);
    }
  };
}

export default Middleware;
