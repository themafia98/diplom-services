import express from 'express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import nodemailer from 'nodemailer';
import socketio from 'socket.io';
import passport from 'passport';
import helmet from 'helmet';
import chalk from 'chalk';
import { Route } from '../../utils/Interfaces/Interfaces.global';
import RouterInstance from '../Router';
import { Server as HttpServer } from 'http';
import { Mail } from '../../utils/Interfaces/Interfaces.global';
import RestEntitiy from './RestEntity';
import Chat from '../Chat';
import Utils from '../../utils/utils.global';
import Mailer from '../Mail';

import DropboxStorage from '../../Services/Dropbox.service';

import limiter from '../../config/limiter';
import Instanse from '../../utils/instanse';
import Middleware from '../../utils/middlewares';
import ProcessRouter from '../Process/ProcessRouter';
import { CONTROLLERS, CONTROLLERS_MAP } from './Server.constant';
import authConfig from '../../config/auth.config';

namespace Http {
  const { catchError, jsonWebTokenRegister, checkPrivateRoute, timer, securityChecker } = Middleware;
  export class ServerRunner extends RestEntitiy {
    SessionStore = MongoStore(session);

    private sessionConfig = {
      secret: authConfig.SECRET,
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
      new Chat(Instanse.ws).run();

      Utils.initControllers(
        Object.values(CONTROLLERS).map((controllerKey) => CONTROLLERS_MAP[controllerKey]),
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
