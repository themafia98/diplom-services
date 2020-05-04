import { Response, NextFunction } from 'express';
import _ from 'lodash';
import passport from 'passport';
import { UserModel } from '../Models/Database/Schema';
import { ResRequest, ParserResult } from '../Utils/Types';
import { Request, App, BodyLogin, Mail, User, Controller } from '../Utils/Interfaces';
import Action from '../Models/Action';
import Decorators from '../Decorators';
import { SentMessageInfo } from 'nodemailer';

namespace General {
  const Post = Decorators.Post;
  const Delete = Decorators.Delete;
  const Controller = Decorators.Controller;
  @Controller('/')
  export class Main implements Controller<FunctionConstructor> {
    @Post({ path: '/auth', private: true })
    protected auth(req: Request, res: Response, next: NextFunction, server: App): Response {
      try {
        const { dbm = null } = server.locals || {};
        if (dbm) dbm.connection().catch((err) => console.error(err));
        return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        return res.sendStatus(503);
      }
    }

    @Post({ path: '/reg', private: false })
    protected async reg(req: Request, res: Response, next: NextFunction, server: App): ResRequest {
      try {
        if (!req.body || (req.body && _.isEmpty(req.body))) throw new Error('Invalid auth data');

        const service = server.locals;
        const connect = await service.dbm.connection();

        if (!connect) {
          console.log('Connect reg:', connect);
          return res.sendStatus(503);
        }

        await UserModel.create(
          { ...req.body, accept: true, rules: 'full' },
          async (err: Error): ResRequest => {
            if (err) {
              console.error(err);
              return res.sendStatus(400);
            }
            if (!res.headersSent) return res.sendStatus(200);
          },
        );
      } catch (err) {
        console.error(err);
        if (!res.headersSent) return res.sendStatus(400);
      }
    }

    @Post({ path: '/login', private: false })
    protected async login(req: Request, res: Response, next: NextFunction, server: App) {
      const { dbm = null } = server.locals || {};
      const body: BodyLogin = req.body;
      if (dbm) dbm.connection().catch((err) => console.error(err));
      if (!body || (body && _.isEmpty(body))) return void res.sendStatus(503);

      return await passport.authenticate(
        'local',
        async (err: Error, user: User): ResRequest => {
          try {
            if (!user || err) {
              return res.status(401).send('Пользователь не найден, проверьте введеные данные.');
            }
            const { password = '' } = body;

            const isValidPassword = await user.checkPassword(password).catch(
              (err: Error): Response => {
                console.error(err);
                return res.status(503).send('Ошибка авторизации.');
              },
            );

            if (res.headersSent) return;

            if (!isValidPassword) {
              return res.status(401).send('Неверные данные для авторизации.');
            }
            user.token = user.generateJWT();
            req.login(
              user,
              (err: Error): Response => {
                if (err) {
                  res.status(404).send(err.message);
                }
                return res.json({ user: user.toAuthJSON() });
              },
            );
          } catch (err) {
            console.error(err);
            if (!res.headersSent) return res.status(503).send('Ошибка авторизации.');
          }
        },
      )(req, res, next);
    }

    @Post({ path: '/userload', private: true })
    protected async userload(req: Request, res: Response, server: App): Promise<Response> {
      const { dbm = null } = server.locals || {};
      if (dbm) dbm.connection().catch((err) => console.error(err));
      const { user } = req;
      if (user) return res.json({ user: (<User>user).toAuthJSON() });
      else {
        res.clearCookie('connect.sid');
        return res.sendStatus(302);
      }
    }

    @Delete({ path: '/logout', private: true })
    protected async logout(req: Request, res: Response): Promise<Response> {
      return req.session.destroy(
        (err: Error): Response => {
          if (err) console.error(err);
          req.logOut(); // passportjs logout
          res.clearCookie('connect.sid');
          return res.sendStatus(200);
        },
      );
    }

    @Post({ path: '/recovory', private: false })
    protected async recovoryPassword(
      req: Request,
      res: Response,
      next: NextFunction,
      server: App,
    ): Promise<Response> {
      try {
        const { mailer } = server.locals;
        const body: BodyLogin = req.body;

        const { recovoryField = '' } = body;

        const actionPath: string = 'users';
        const actionType: string = 'recovory_checker';

        const checkerAction: Action.ActionParser = new Action.ActionParser({
          actionPath,
          actionType,
          body,
        });

        const password: ParserResult = await checkerAction.getActionData(body);

        if (!password) {
          throw new Error('Invalid checker data');
        }

        const to: string = <string>recovoryField;

        const result: Promise<SentMessageInfo> = await (<Mail>mailer).send(
          to,
          'Восстановление пароля / ControllSystem',
          `Ваш новый пароль: ${password}`,
        );

        if (!result) {
          throw new Error('Invalid send mail');
        }

        return res.sendStatus(200);
      } catch (error) {
        console.error(error);
        res.statusMessage = error.message;
        return res.sendStatus(503);
      }
    }
  }
}

export default General;
