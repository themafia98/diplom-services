import express, { Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import nodemailer from 'nodemailer';
import socketio from 'socket.io';
import passport from 'passport';
import helmet from 'helmet';
import chalk from 'chalk';
import { Route, Dbms, User } from '../../Utils/Interfaces';
import RouterInstance from '../Router';
import { Server as HttpServer } from 'http';
import { Request, Mail } from '../../Utils/Interfaces';
import RestEntitiy from './RestEntity';
import Utils from '../../Utils';

import Statistic from '../../Controllers/Statistic';
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
import * as passportLocal from 'passport-local';

import wsWorkerManager from '../../Utils/instanseWs';
import wsEvents from '../../Controllers/Contact/Chat/wsEvents';

import limiter from '../../config/limiter';
import { ObjectId } from 'mongodb';

namespace Http {
  const LocalStrategy = passportLocal.Strategy;

  export class ServerRunner extends RestEntitiy {
    public startResponse<RequestHandler>(req: Request, res: Response, next: NextFunction): void {
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

    public initErrorHandler(server: HttpServer, dbm: Dbms): void {
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

    public jsonWebTokenExec(dbm: Dbms): void {
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
    }

    public async start(): Promise<void> {
      const Main: Readonly<Function> = General.Main;
      const TasksAlias: Readonly<Function> = Tasks.TasksController;
      const SystemAlias: Readonly<Function> = System.SystemData;
      const NewsAlias: Readonly<Function> = News.NewsController;
      const ChatAlias: Readonly<Function> = Chat.ChatController;
      const SettingsAlias: Readonly<Function> = Settings.SettingsController;
      const WikiAlias: Readonly<Function> = Wiki.WikiController;
      const CabinetAlias: Readonly<Function> = Cabinet.CabinetController;
      const StatisticAlias: Readonly<Function> = Statistic.StatisticController;

      this.setApp(express());
      this.getApp().disabled('x-powerd-by');
      this.getApp().use(helmet());
      this.getApp().use(express.urlencoded({ extended: true }));
      this.getApp().use(express.json());
      this.getApp().set('port', this.getPort());

      const SessionStore = MongoStore(session);
      const MONGODB_URI: Readonly<string> = process.env.MONGODB_URI as string;
      const DROPBOX_TOKEN: Readonly<string> = process.env.DROPBOX_TOKEN as string;

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

      const dbm: Dbms = new Database.ManagmentDatabase('controllSystem', MONGODB_URI);

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
      this.jsonWebTokenExec(dbm);

      const instanceRouter: Route = RouterInstance.Router.instance(this.getApp());

      const server: HttpServer = this.getApp().listen(this.getPort(), (): void => {
        console.log(`${chalk.yellow(`Worker ${process.pid}`)} ${chalk.green('started')}`);
        console.log(`Server listen on ${chalk.blue.bold(this.getPort())}.`);

        // callback("", os.cpus().length);
      });

      const regTicketLimitter = rateLimit({
        windowMs: 2 * 60 * 1000,
        max: 1,
        message: 'Заявку можно отправлять раз в 2 минуты.',
      });

      /** initial entrypoint route */
      this.setRest(instanceRouter.initInstance('/rest'));
      this.getRest().use(this.startResponse);
      this.getRest().use(limiter);
      this.getRest().use('/tasks/regTicket', regTicketLimitter);

      wsWorkerManager.startSocketConnection(socketio(server));

      wsEvents(wsWorkerManager, dbm, server); /** chat */

      Utils.initControllers(
        [
          Main as FunctionConstructor,
          TasksAlias as FunctionConstructor,
          WikiAlias as FunctionConstructor,
          NewsAlias as FunctionConstructor,
          SystemAlias as FunctionConstructor,
          ChatAlias as FunctionConstructor,
          SettingsAlias as FunctionConstructor,
          CabinetAlias as FunctionConstructor,
          StatisticAlias as FunctionConstructor,
        ],
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
