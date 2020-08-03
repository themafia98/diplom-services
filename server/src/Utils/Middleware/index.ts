import { Response, NextFunction } from 'express';
import passport from 'passport';
import * as passportLocal from 'passport-local';
import { Dbms, User, Request } from '../Interfaces';
import { UserModel } from '../../Models/Database/Schema';
import { ObjectId } from 'mongodb';

namespace Middleware {
  const LocalStrategy = passportLocal.Strategy;

  export const timer = <RequestHandler>(req: Request, res: Response, next: NextFunction): void => {
    req.start = new Date();
    next();
  };

  export const catchError = (err: Error, req: Request, res: Response, next: NextFunction): void => {
    // set locals, only providing error in development
    const today: Readonly<Date> = new Date();
    const time: Readonly<string> = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    const day: Readonly<string> = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    console.error(err.name);
    console.log(`time: ${time}, day: ${day}.`);
    if (!err.name) {
      return void next();
    }

    console.error(err.name);
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
