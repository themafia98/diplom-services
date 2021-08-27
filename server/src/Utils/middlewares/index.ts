import { Response, NextFunction, Request } from 'express';
import passport from 'passport';
// @ts-ignore
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
import { signAvailableActions } from '../utils.global';

export const useTimer = (req: Request, res: Response, next: NextFunction): void => {
  (<any>req).start = new Date();
  next();
};

export const useAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

  // @ts-ignore
  const user = await UserModel.findById(Types.ObjectId(uid));
  const { access } = (user as Record<string, any>) || {};

  if (user && req.body && access) {
    availableActions = AccessRole.getAvailableActions(req.body.moduleName || '', access as AccessConfig[]);
  }

  if (Array.isArray(availableActions) && availableActions.length) {
    signAvailableActions(req as RequestWithParams, availableActions as string[]);
  }

  if (!uid) {
    next();
    return;
  }

  (<any>req).uid = isValidObjectId(uid) ? Types.ObjectId(uid as string) : null;

  next();
};

export const handleError = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // set locals, only providing error in development
  console.error(err);

  next();
};

export const useJWT = (dbm: Dbms): void => {
  passport.use(
    new LocalStrategy.Strategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email: string, password: string, done: any): Promise<any> => {
        /** auth */
        try {
          const connect = await dbm.connection();
          if (!connect) throw new Error('Bad connect');
          const result = await UserModel.findOne({ email });
          if (!result) {
            await dbm.disconnect();
          }
          const userResult: User = (await UserModel.findOne({ email })) as User;
          if (!userResult) {
            await dbm.disconnect();
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

  if (!authConfig.SECRET) {
    console.warn('jwt secret invalid for use jwt strategy');
    return;
  }

  passport.use(
    new JwtStrategy.Strategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: authConfig.SECRET,
      },
      async (jwtPayload: { sub: string }, done: any): Promise<any> => {
        if (!isValidObjectId(jwtPayload.sub)) {
          done(null, false, { message: 'Invalid token' });
        }

        const currentUser: User = (await UserModel.findById(Types.ObjectId(jwtPayload.sub))) as User;

        if (!currentUser) {
          done(null, false, { message: 'Incorrect email.' });
          return;
        }

        const resultDone: any = done(null, currentUser);
        // eslint-disable-next-line consistent-return
        return resultDone;
      },
    ),
  );

  passport.serializeUser((user: any, done: any): void => {
    done(null, user?.id);
  });

  passport.deserializeUser(
    // eslint-disable-next-line consistent-return
    async (id: string, done: any): Promise<void | any> => {
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

export const useSession = (req: Request, res: Response, next: NextFunction): Response | void => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.clearCookie('connect.sid');
  return res.sendStatus(503);
};
