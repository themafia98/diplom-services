import { Response, NextFunction } from 'express';
import _ from 'lodash';
import passport from 'passport';
import { UserModel } from '../../Models/Database/Schema';
import { ResRequest, ParserResult } from '../../Utils/Types/types.global';
import {
  Request,
  App,
  BodyLogin,
  Mail,
  User,
  Controller as ControllerApi,
  QueryParams,
} from '../../Utils/Interfaces/Interfaces.global';
import Action from '../../Models/Action';
import Decorators from '../../Utils/decorators';
import { SentMessageInfo } from 'nodemailer';
import { GENERAL_ROUTE } from './General.path';

namespace General {
  const Post = Decorators.Post;
  const Delete = Decorators.Delete;
  const Controller = Decorators.Controller;

  @Controller('/')
  export class Main implements ControllerApi<FunctionConstructor> {
    @Post({ path: GENERAL_ROUTE.CHECK_SESSION_JWT, private: true })
    protected auth(req: Request, res: Response): Response {
      return res.sendStatus(200);
    }

    @Post({ path: GENERAL_ROUTE.CREATE_USER, private: false })
    protected async reg(req: Request, res: Response): ResRequest {
      try {
        if (!req.body) {
          throw new Error('Invalid auth data');
        }

        const { user = null } = req.body as Record<string, User>;

        if (!user) {
          throw new Error('Bad user data for registration');
        }

        const userDoc: object = { ...user, accept: true, rules: 'full' };
        const userValues = await UserModel.create(userDoc);

        if (!userValues) {
          res.sendStatus(400);
          return;
        }

        if (!res.headersSent) return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        if (!res.headersSent) return res.sendStatus(400);
      }
    }

    @Post({ path: GENERAL_ROUTE.LOG_IN, private: false })
    protected async login(req: Request, res: Response, next: NextFunction) {
      const body: BodyLogin = req.body;

      if (!body || (body && _.isEmpty(body))) {
        res.sendStatus(503);
      }

      const result = await passport.authenticate(
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
              async (err: Error): Promise<Response> => {
                if (err) {
                  res.status(404).send(err.message);
                }

                const jsonUser = user.toAuthJSON();
                const userKeys = Object.keys(jsonUser);

                const parsedUser: object = userKeys.reduce((acc: object, key: string) => {
                  if (key === 'token') return acc;

                  return {
                    ...acc,
                    [key]: jsonUser[key],
                  };
                }, {});

                return res.json({
                  user: parsedUser,
                  token: user && user.token ? user.token : null,
                });
              },
            );
          } catch (err) {
            console.error(err);
            if (!res.headersSent) {
              return res.status(503).send('Ошибка авторизации.');
            }
          }
        },
      )(req, res, next);

      return result;
    }

    @Post({ path: GENERAL_ROUTE.LOAD_USER, private: true })
    protected async userload({ user }: Request, res: Response): Promise<Response> {
      if (user) {
        return res.json({ user: (user as User).toAuthJSON() });
      }

      res.clearCookie('connect.sid');
      return res.sendStatus(302);
    }

    @Delete({ path: GENERAL_ROUTE.LOG_OUT, private: true })
    protected async logout(req: Request, res: Response): Promise<Response> {
      return req.session.destroy(
        (err: Error): Response => {
          if (err) {
            console.error(err);
          }

          req.logOut();
          res.clearCookie('connect.sid');
          return res.sendStatus(200);
        },
      );
    }

    @Post({ path: GENERAL_ROUTE.SEND_MAIL, private: true })
    protected async mailerResponse(
      req: Request,
      res: Response,
      next: NextFunction,
      server: App,
    ): Promise<Response> {
      try {
        const { mailer } = server.locals;
        const body: BodyLogin = req.body;

        const { queryParams = {} } = body;
        const { mailBody = '', themeMail = '', to = '' } = queryParams as QueryParams;

        if (!mailBody || !to) {
          throw new Error('Invalid mail data');
        }

        const result: Promise<SentMessageInfo> = await (mailer as Mail).send(
          to,
          themeMail || 'Письмо об оказании услуг',
          mailBody,
        );

        if (!result) throw new Error('Invalid send mail');

        return res.sendStatus(200);
      } catch (error) {
        console.error(error);
        res.statusMessage = error.message;
        return res.sendStatus(503);
      }
    }

    @Post({ path: GENERAL_ROUTE.RECOVORY_PASSWORD, private: false })
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

        const checkerAction: Action.ActionParser = new Action.ActionParser({
          actionPath: 'users',
          actionType: 'recovory_checker',
          body,
        });

        const responseExec: Function = await checkerAction.actionsRunner(body, 'exec');
        const password: ParserResult = await responseExec(req, res, { done: true }, false);

        if (!password) {
          throw new Error('Invalid checker data');
        }

        const to: string = recovoryField as string;

        const result: Promise<SentMessageInfo> = await (mailer as Mail).send(
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