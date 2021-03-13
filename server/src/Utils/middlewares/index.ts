import { Response, NextFunction, Request } from 'express';
import passport from 'passport';
import JwtStrategy, { ExtractJwt } from 'passport-jwt';
import LocalStrategy from 'passport-local';
import { AccessConfig, Dbms, RequestWithParams, User } from '../Interfaces/Interfaces.global';
import { UserModel } from '../../Models/Database/Schema';
import url from 'url';
import querystring from 'querystring';
import { isValidObjectId, Types } from 'mongoose';
import AccessRole from '../../Models/AccessRole';
import authConfig from '../../config/auth.config';
import { decode } from 'jsonwebtoken';
import Utils from '../utils.global';

namespace Middleware {
  export const timer = (req: Request, res: Response, next: NextFunction): void => {
    (<any>req).start = new Date();
    next();
  };

  export const securityChecker = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { query } = url.parse(req.url);
    const { uid: urlUid = '' } = querystring.parse(query as string);

    const jwtToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const payload = jwtToken ? decode(jwtToken) : null;

    let uid = null;
    let availableActions = null;

    if (urlUid) {
      uid = urlUid;
    } else if (payload && payload.sub) {
      uid = payload.sub;
    }

    const user = await UserModel.findById(Types.ObjectId(uid));
    const { access } = (user as Record<string, any>) || {};


    if (user && req.body && access) {
      availableActions = AccessRole.getAvailableActions(req.body.moduleName || '', access as AccessConfig[]);
    }

    if (Array.isArray(availableActions) && availableActions.length) {
      Utils.signAvailableActions(req as RequestWithParams, availableActions as string[]);
    }

    if (!uid) {
      next();
      return;
    }

    (<any>req).uid = isValidObjectId(uid) ? Types.ObjectId(uid as string) : null;

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

          const currentUser: User = (await UserModel.findById(Types.ObjectId(jwt_payload.sub))) as User;

          if (!currentUser) {
            done(null, false, { message: 'Incorrect email.' });
            return;
          }

          return done(null, currentUser);
        },
      ),
    );

    passport.serializeUser((user: any, done: Function): void => {
      done(null, user?.id);
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
