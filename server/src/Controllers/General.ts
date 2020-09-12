import { Response, NextFunction } from 'express';
import _ from 'lodash';
import passport from 'passport';
import { UserModel } from '../Models/Database/Schema';
import { ResRequest, ParserResult } from '../Utils/Types';
import { Request, App, BodyLogin, Mail, User, Controller as ControllerApi } from '../Utils/Interfaces';
import Action from '../Models/Action';
import Decorators from '../Decorators';
import { SentMessageInfo } from 'nodemailer';

namespace General {
  const Post = Decorators.Post;
  const Delete = Decorators.Delete;
  const Controller = Decorators.Controller;

  @Controller('/')
  export class Main implements ControllerApi<FunctionConstructor> {
    @Post({ path: '/auth', private: true })
    protected auth(req: Request, res: Response): Response {
      try {
        return res.sendStatus(200);
      } catch (err) {
        console.error(err);
        return res.sendStatus(503);
      }
    }

    @Post({ path: '/reg', private: false })
    protected async reg(req: Request, res: Response): ResRequest {
      try {
        if (!req.body || (req.body && _.isEmpty(req.body))) {
          throw new Error('Invalid auth data');
        }

        const { user = {} } = req.body as Record<string, User>;

        if (!user || _.isEmpty(user)) {
          throw new Error('Bad user data for registration');
        }

        await UserModel.create(
          { ...user, accept: true, rules: 'full' },
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
    protected async login(req: Request, res: Response, next: NextFunction) {
      const body: BodyLogin = req.body;

      if (!body || (body && _.isEmpty(body))) return void res.sendStatus(503);

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
              (err: Error): Response => {
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

                return res.json({ user: parsedUser, token: user && user.token ? user.token : null });
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

    @Post({ path: '/userload', private: true })
    protected async userload(req: Request, res: Response): Promise<Response> {
      const { user } = req;
      if (user) return res.json({ user: (user as User).toAuthJSON() });
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

    @Post({ path: '/mailerResponse', private: true })
    protected async mailerResponse(
      req: Request,
      res: Response,
      next: NextFunction,
      server: App,
    ): Promise<Response> {
      try {
        const { mailer } = server.locals;
        const body: BodyLogin = req.body;

        const { queryParams = {} } = body as Record<string, string>;
        const { mailBody = '', themeMail = '', to = '' } = (queryParams as Record<string, string>) || {};

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
