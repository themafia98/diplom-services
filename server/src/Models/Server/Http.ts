import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import nodemailer from 'nodemailer';
import socketio from 'socket.io';
import passport from 'passport';
import helmet from 'helmet';
import chalk from 'chalk';
import { Route } from '../../Utils/Interfaces';
import RouterInstance from '../Router';
import { Server as HttpServer } from 'http';
import { Mail } from '../../Utils/Interfaces';
import RestEntitiy from './RestEntity';
import Chat from '../Chat';
import Utils from '../../Utils';

import Statistic from '../../Controllers/Statistic';
import System from '../../Controllers/Main';
import Cabinet from '../../Controllers/Cabinet';
import Settings from '../../Controllers/Settings';
import General from '../../Controllers/General';
import ChatController from '../../Controllers/Contact/Chat';
import Tasks from '../../Controllers/Tasks';
import Wiki from '../../Controllers/Wiki';
import News from '../../Controllers/Contact/News';
import Mailer from '../Mail';

import DropboxStorage from '../../Services/Dropbox.service';

import limiter from '../../config/limiter';
import Instanse from '../../Utils/instanse';
import Middleware from '../../Utils/Middleware';
import ProcessRouter from '../Process/ProcessRouter';

namespace Http {
  export class ServerRunner extends RestEntitiy {
    SessionStore = MongoStore(session);

    private sessionConfig = {
      secret: 'jwtsecret',
      saveUninitialized: true,
      resave: true,
      store: new this.SessionStore({
        url: process.env.MONGODB_URI as string,
        collection: 'sessions',
      }),
    };

    private smtpConfig = {
      host: 'smtp.yandex.ru',
      port: 465,
      auth: {
        user: process.env.TOKEN_YANDEX_USER,
        pass: process.env.TOKEN_YANDEX_PASSWORD,
      },
    };

    get session() {
      return this.sessionConfig;
    }

    get smtp() {
      return this.smtpConfig;
    }

    public async start(): Promise<void> {
      const Main: Readonly<Function> = General.Main;
      const TasksAlias: Readonly<Function> = Tasks.TasksController;
      const SystemAlias: Readonly<Function> = System.SystemData;
      const NewsAlias: Readonly<Function> = News.NewsController;
      const ChatAlias: Readonly<Function> = ChatController;
      const SettingsAlias: Readonly<Function> = Settings.SettingsController;
      const WikiAlias: Readonly<Function> = Wiki.WikiController;
      const CabinetAlias: Readonly<Function> = Cabinet.CabinetController;
      const StatisticAlias: Readonly<Function> = Statistic.StatisticController;

      const { catchError, jsonWebTokenRegister, checkPrivateRoute, timer, securityChecker } = Middleware;

      this.setApp(express());
      this.getApp().disabled('x-powerd-by');
      this.getApp().use(helmet());
      this.getApp().use(express.urlencoded({ extended: true }));
      this.getApp().use(express.json());
      this.getApp().set('port', this.getPort());

      this.getApp().use(session(this.session));
      this.getApp().use(passport.initialize());
      this.getApp().use(passport.session());
      this.getApp().use(catchError as any);

      const dropbox = new DropboxStorage.DropboxManager();
      const mailer: Readonly<Mail> = new Mailer.MailManager(nodemailer, this.smtp, {
        from: process.env.TOKEN_YANDEX_USER,
      });

      const mailerClient = mailer.create();

      if (!mailerClient) {
        console.error('Invalid create transport mailer');
      }

      this.getApp().locals.dropbox = dropbox;
      this.getApp().locals.mailer = mailerClient;
      jsonWebTokenRegister(Instanse.dbm);

      const instanceRouter: Route = RouterInstance.Router.instance(this.getApp());

      const server: HttpServer = this.getApp().listen(this.getPort(), (): void => {
        console.log(`${chalk.yellow(`Worker ${process.pid}`)} ${chalk.green('started')}`);
        console.log(`Server listen on ${chalk.blue.bold(this.getPort())}.`);
      });

      const regTicketLimitter = rateLimit({
        windowMs: 2 * 60 * 1000,
        max: 1,
        message: 'Заявку можно отправлять раз в 2 минуты.',
      });

      /** initial entrypoint route */
      this.setRest(instanceRouter.initInstance('/rest'));
      this.getRest().use(timer);
      this.getRest().use(securityChecker);
      this.getRest().use(limiter);
      this.getRest().use('/tasks/regTicket', regTicketLimitter);

      Instanse.ws.startSocketConnection(new socketio.Server(server));
      const chat = new Chat(Instanse.ws);
      chat.run();

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
        checkPrivateRoute.bind(this),
        Instanse.ws,
      );
      ProcessRouter.errorEventsRegister(server, Instanse.dbm);
    }
  }
}

export default Http;
