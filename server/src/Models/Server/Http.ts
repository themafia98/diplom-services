import express, { Response, NextFunction } from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import nodemailer from 'nodemailer';
import socketio from 'socket.io';
import passport from 'passport';
import _ from 'lodash';
import helmet from 'helmet';
import chalk from 'chalk';
import { Route } from '../../Utils/Interfaces';
import RouterInstance from '../Router';
import { Server as HttpServer } from 'http';
import { Request, Mail } from '../../Utils/Interfaces';
import RestEntitiy from './RestEntity';
import Utils from '../../Utils';

import System from '../../Controllers/Main';
import Cabinet from '../../Controllers/Cabinet';
import Settings from '../../Controllers/Settings';
import General from '../../Controllers/General';
import Chat from '../../Controllers/Contact/Chat';
import Tasks from '../../Controllers/Tasks';
import Wiki from '../../Controllers/Wiki';
import News from '../../Controllers/Contact/News';
import Database from '../Database';
import Mailer from '../Mail';

import DropboxStorage from '../../Services/Dropbox';

import { UserModel } from '../Database/Schema';

import jwt, { StrategyOptions } from 'passport-jwt';
import * as passportLocal from 'passport-local';

import Entrypoint, { wsWorkerManager } from '../..';
import wsEvents from '../../Controllers/Contact/Chat/wsEvents';

import limiter from '../../config/limiter';

namespace Http {
  const LocalStrategy = passportLocal.Strategy;

  export class ServerRunner extends RestEntitiy {
    constructor(port: string) {
      super(port);
    }

    public startResponse(req: Request, res: Response, next: NextFunction): void {
      req.start = new Date();
      next();
    }

    public isPrivateRoute(req: Request, res: Response, next: NextFunction): Response | void {
      if (req.isAuthenticated()) {
        return next();
      } else {
        res.clearCookie('connect.sid');
        return res.sendStatus(503);
      }
    }

    public initErrorHandler(server: HttpServer, dbm: Readonly<Database.ManagmentDatabase>): void {
      server.on('clientError', (err, socket) => {
        console.log('clientError');
        console.error(err);
        socket.destroy();
      });

      process.on('SIGTERM', (): void => {
        console.log('SIGTERM, uptime:', process.uptime());
        server.close();
      });

      process.on('uncaughtException', (err: Error) => {
        // handle the error safely
        if (err.name === 'MongoNetworkError') {
          dbm.disconnect().catch((err: Error) => console.error(err));
          console.log('uncaughtException. uptime:', process.uptime());
          console.error(err);
        } else {
          console.error(err);
          console.log('exit error, uptime:', process.uptime());
          process.exit(1);
        }
      });
    }

    public errorLogger(err: Error, req: Request, res: Response, next: NextFunction): void {
      // set locals, only providing error in development
      const today: Readonly<Date> = new Date();
      const time: Readonly<string> = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
      const day: Readonly<string> =
        today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
      console.error(err.name);
      console.log(`time: ${time}, day: ${day}.`);
      if (!err.name) {
        return void next();
      }

      console.error(err.name);
      next();
    }

    public initJWT(dbm: Readonly<Database.ManagmentDatabase>): void {
      passport.use(
        new LocalStrategy(
          {
            usernameField: 'email',
            passwordField: 'password',
          },
          async (email: string, password: string, done: Function) => {
            try {
              const connect = await dbm.connection();
              if (!connect) throw new Error('Bad connect');
              UserModel.findOne({ email }, async (err: Error, user: Record<string, any>) => {
                await dbm.disconnect().catch((err: Error) => console.error(err));
                if (err) return done(err);
                else if (!user || !user.checkPassword(password)) {
                  return done(null, false, {
                    message: 'Нет такого пользователя или пароль неверен.',
                  });
                } else {
                  return done(null, user);
                }
              });
            } catch (err) {
              console.error(err);
              return done(err);
            }
          },
        ),
      );

      const jwtOptions: Readonly<object> = {
        jwtFromRequest: jwt.ExtractJwt.fromAuthHeaderWithScheme('jwt'),
        secretOrKey: 'jwtsecret',
      };

      passport.use(
        new jwt.Strategy(<StrategyOptions>jwtOptions, async function(
          payload: Partial<{ id: string }>,
          done: Function,
        ) {
          try {
            const connect = await dbm.connection();
            if (!connect) throw new Error('bad connection');
            UserModel.findOne(payload.id, async (err: Error, user: Record<string, any>) => {
              await dbm.disconnect().catch((err: Error) => console.error(err));

              if (err) {
                return done(err);
              }
              if (user) {
                done(null, user);
              } else {
                done(null, false);
              }
            });
          } catch (err) {
            return done(err);
          }
        }),
      );

      passport.serializeUser((user: Partial<{ id: string }>, done: Function) => {
        done(null, user.id);
      });

      passport.deserializeUser(async (id: string, done: Function) => {
        try {
          const connect = await dbm.connection();
          if (!connect) throw new Error('Bad connect');
          await UserModel.findById(id, async (err: Error, user: Record<string, any>) => {
            if (err) {
              console.log(err);
              console.log(user);
            }
            await dbm.disconnect().catch((err: Error) => console.error(err));
            done(err, user);
          }).catch(err => {
            done(err, null);
          });
        } catch (err) {
          console.error(err);
          return done(err);
        }
      });
    }

    public async start(callback: Function): Promise<void> {
      const Main: Readonly<Function> = General.Main;
      const TasksAlias: Readonly<Function> = Tasks.TasksController;
      const SystemAlias: Readonly<Function> = System.SystemData;
      const NewsAlias: Readonly<Function> = News.NewsController;
      const ChatAlias: Readonly<Function> = Chat.ChatController;
      const SettingsAlias: Readonly<Function> = Settings.SettingsController;
      const WikiAlias: Readonly<Function> = Wiki.WikiController;
      const CabinetAlias: Readonly<Function> = Cabinet.CabinetController;

      this.setApp(express());
      this.getApp().disabled('x-powerd-by');
      this.getApp().use(helmet());
      this.getApp().use(express.urlencoded({ extended: true }));
      this.getApp().use(express.json());
      this.getApp().set('port', this.getPort());

      const SessionStore = MongoStore(session);
      const MONGODB_URI: Readonly<string> = <string>process.env.MONGODB_URI;
      const DROPBOX_TOKEN: Readonly<string> = <string>process.env.DROPBOX_TOKEN;

      this.getApp().use(
        session({
          secret: 'jwtsecret',
          saveUninitialized: true,
          resave: true,
          store: new SessionStore({
            url: MONGODB_URI,
            collection: 'sessions',
          }),
        }),
      );
      this.getApp().use(passport.initialize());
      this.getApp().use(passport.session());
      this.getApp().use(this.errorLogger);

      const dbm: Readonly<Database.ManagmentDatabase> = new Database.ManagmentDatabase(
        'controllSystem',
        MONGODB_URI,
      );

      const dropbox = new DropboxStorage.DropboxManager({ token: DROPBOX_TOKEN });
      const mailer: Readonly<Mail> = new Mailer.MailManager(
        nodemailer,
        {
          host: 'smtp.yandex.ru',
          port: 465,
          auth: {
            user: process.env.TOKEN_YANDEX_USER,
            pass: process.env.TOKEN_YANDEX_PASSWORD,
          },
        },
        {
          from: process.env.TOKEN_YANDEX_USER,
        },
      );

      const createResult = mailer.create();

      if (!createResult) {
        console.error('Invalid create transport mailer');
      }

      this.getApp().locals.dbm = dbm;
      this.getApp().locals.dropbox = dropbox;
      this.getApp().locals.mailer = mailer;
      this.initJWT(dbm);

      const instanceRouter: Route = RouterInstance.Router.instance(this.getApp());

      const server: HttpServer = this.getApp().listen(this.getPort(), (): void => {
        console.log(`${chalk.yellow(`Worker ${process.pid}`)} ${chalk.green('started')}`);
        console.log(`Server listen on ${chalk.blue.bold(this.getPort())}.`);

        // callback("", os.cpus().length);
      });

      /** initial entrypoint route */
      this.setRest(instanceRouter.initInstance('/rest'));
      this.getRest().use(this.startResponse);
      this.getRest().use(limiter);

      wsWorkerManager.startSocketConnection(socketio(server));

      wsEvents(wsWorkerManager, dbm, server); /** chat */

      Utils.initControllers(
        [Main, TasksAlias, WikiAlias, NewsAlias, SystemAlias, ChatAlias, SettingsAlias, CabinetAlias],
        this.getApp.bind(this),
        this.getRest.bind(this),
        this.isPrivateRoute.bind(this),
        wsWorkerManager,
      );

      this.initErrorHandler(server, dbm);
    }
  }
}

export default Http;