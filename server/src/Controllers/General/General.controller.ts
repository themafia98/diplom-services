import { Response, NextFunction } from 'express';
import _ from 'lodash';
import url from 'url';
import querystring from 'querystring';
import passport from 'passport';
import { UserModel } from '../../Models/Database/Schema';
import { ResRequest, ParserResult } from '../../Utils/Types/types.global';
import { Request, App, Mail, User, QueryParams, Runner } from '../../Utils/Interfaces/Interfaces.global';
import { Get, Post, Delete, Controller } from '../../Utils/decorators/Decorators';
import { SentMessageInfo } from 'nodemailer';
import { GENERAL_ROUTE } from './General.path';
import ActionRunner from '../../Models/ActionRunner/ActionRunner';
import { ACTION_TYPE } from '../../Models/ActionsEntitys/ActionUsers/ActionUsers.constant';
import { Document } from 'mongoose';
import { ENTITY } from '../../Models/Database/Schema/Schema.constant';
import { getVersion } from '../../Utils/utils.global';

@Controller('/')
class GeneralController {
  static version = getVersion();

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

      const userValues = await UserModel.create(user);

      if (!userValues) {
        res.sendStatus(400);
        return;
      }

      if (!res.headersSent) {
        res.sendStatus(200);
        return;
      }
    } catch (err) {
      console.error(err);
      if (!res.headersSent) {
        res.sendStatus(400);
      }
    }
  }

  @Post({ path: GENERAL_ROUTE.LOG_IN, private: false })
  protected async login(req: Request, res: Response, next: NextFunction) {
    const { body } = req;

    if (!body || (body && _.isEmpty(body))) {
      res.sendStatus(503);
    }

    const result = await passport.authenticate(
      'local',
      // eslint-disable-next-line consistent-return
      async (err: Error, user: User): ResRequest => {
        try {
          if (!user || err) {
            return res.status(401).send('Пользователь не найден, проверьте введеные данные.');
          }
          const { password = '' } = body;

          const isValidPassword = await user.checkPassword(password).catch(
            (errCheck: Error): Response => {
              console.error(errCheck);
              return res.status(503).send('Ошибка авторизации.');
            },
          );

          if (res.headersSent) {
            // eslint-disable-next-line consistent-return
            return;
          }

          if (!isValidPassword) {
            return res.status(401).send('Неверные данные для авторизации.');
          }
          user.token = user.generateJWT();
          req.login(
            user,
            async (errLogin: Error): Promise<Response> => {
              if (errLogin) {
                res.status(404).send(errLogin.message);
              }

              const jsonUser = user.toAuthJSON();
              const userKeys = Object.keys(jsonUser);

              const parsedUser: Record<string, any> = userKeys.reduce(
                (acc: Record<string, any>, key: string) => {
                  if (key === 'token') return acc;

                  return {
                    ...acc,
                    [key]: jsonUser[key],
                  };
                },
                {},
              );

              return res.json({
                user: parsedUser,
                token: user && user.token ? user.token : null,
              });
            },
          );
        } catch (criticalErr) {
          console.error(criticalErr);
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
  protected async logout(req: Request, res: Response): Promise<void> {
    req.logOut();
    res.sendStatus(200);
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
      const { body } = req;

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

  @Post({ path: GENERAL_ROUTE.RECOVORY_PASSWORD_TOKEN, private: false })
  protected async verifyPasswordRecovory(
    req: Request,
    res: Response,
    next: NextFunction,
    server: App,
  ): ResRequest {
    const { mailer } = server.locals;
    const { body } = req;
    const { recovoryField = '' } = body;

    const tokenAction: Runner = new ActionRunner({
      actionPath: ENTITY.USERS,
      actionType: ACTION_TYPE.RECOVORY_PASSWORD_TOKEN,
    });

    try {
      const responseExec = await tokenAction.start({ recovoryField }, 'exec');
      const token: Document = await responseExec(req, res, { done: true }, false);

      if (!token) {
        throw new Error('Invalid verify recovory password');
      }

      const urlRecovort = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
      const to: string = recovoryField as string;
      // eslint-disable-next-line no-underscore-dangle
      const link = `${urlRecovort}${GENERAL_ROUTE.RECOVORY_PASSWORD}?recovoryToken=${token._id}&to=${to}`;

      const result: Promise<SentMessageInfo> = await (mailer as Mail).send(
        to,
        'Восстановление пароля. Подтверждение / ControllSystem',
        `
          <h4>Смена пароля</h4>
          <p>
            <a target="_blank" href="${link}">
              Ссылка для подтверждения смены пароля
            </a>
          </p>
          `,
        true,
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

  @Get({ path: GENERAL_ROUTE.RECOVORY_PASSWORD, private: false })
  protected async recovoryPassword(
    req: Request,
    res: Response,
    next: NextFunction,
    server: App,
  ): Promise<void> {
    try {
      const { mailer } = server.locals;
      const { query } = url.parse(req.url);
      const { recovoryToken = '', to = '' } = querystring.parse(query as string);

      if (!recovoryToken || !to) {
        throw new Error('bad recovoryToken or email');
      }

      const checkerAction: Runner = new ActionRunner({
        actionPath: ENTITY.USERS,
        actionType: ACTION_TYPE.RECOVORY_PASSWORD,
        body: { recovoryToken, to },
      });

      const responseExec = await checkerAction.start({ to, recovoryToken }, 'exec');
      const password: ParserResult = await responseExec(req, res, { done: true }, false);

      if (!password) {
        throw new Error('Invalid checker data');
      }

      const result: Promise<SentMessageInfo> = await (mailer as Mail).send(
        to as string,
        'Восстановление пароля. / ControllSystem',
        `Ваш новый пароль: ${password}`,
      );

      if (!result) {
        throw new Error('Invalid send mail');
      }

      res.status(200).send('Успешно. Новый пароль будет выслан на почту.');
      return;
    } catch (error) {
      console.error(error);
      res.statusMessage = error.message;
      res.sendStatus(403);
    }
  }
}

export default GeneralController;
