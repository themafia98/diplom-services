import { Response, NextFunction, Request } from 'express';
import passport from 'passport';
import JwtStrategy, { ExtractJwt } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import { Dbms, User } from '../Interfaces/Interfaces.global';
import { UserModel } from '../../Models/Database/Schema';
import { ObjectId } from 'mongodb';

import url from 'url';
import querystring from 'querystring';
import { isValidObjectId, Types } from 'mongoose';
import AccessRole from '../../Models/AccessRole';
import { ACTIONS_ACCESS } from '../../app.constant';
import authConfig from '../../config/auth.config';

namespace Middleware {
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
      new LocalStrategy.Strategy(
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

    passport.use(
      new JwtStrategy.Strategy(
        {
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: authConfig.SECRET,
        },
        async (jwt_payload: { sub: string }, done: any) => {
          if (!isValidObjectId(jwt_payload.sub)) {
            done(null, false, { message: 'Invalid token' });
          }

          const currentUser: User = (await UserModel.findOne({
            where: { _id: Types.ObjectId(jwt_payload.sub) },
          })) as User;

          if (!currentUser) {
            done(null, false, { message: 'Incorrect email.' });
            return;
          }

          return done(null, currentUser);
        },
      ),
    );

    passport.serializeUser((user: Record<string, ObjectId>, done: Function): void => {
      const { id } = user || {};
      done(null, id);
    });

    passport.deserializeUser(
      async (id: string, done: Function): Promise<void | Function> => {
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
