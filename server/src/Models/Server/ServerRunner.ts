/* eslint-disable react-hooks/rules-of-hooks */
import express from 'express';
import rateLimit from 'express-rate-limit';
import socketio from 'socket.io';
import passport from 'passport';
import helmet from 'helmet';
import chalk from 'chalk';
import { Route } from '../../Utils/Interfaces/Interfaces.global';
import { Router } from '../Router/RouterInstance';
import { Server as HttpServer } from 'http';
import { Mail } from '../../Utils/Interfaces/Interfaces.global';
import RestEntitiy from './RestEntity';
import Chat from '../Chat';
import { initControllers } from '../../Utils/utils.global';
import Mailer from '../Mail';
import { DropboxManager } from '../../Services/Dropbox.service';
import useLimitRate from '../../config/limiter';
import instanse from '../../Utils/instanse';
import { handleError, useJWT, useTimer, useAuth } from '../../Utils/middlewares';
import ProcessRouter from '../Process/ProcessRouter';
import {
  CONTROLLERS_REGISTER,
  CONTROLLERS_MAP,
  DEMO_ROUTE_CREATE_TICKET,
  API_ROUTE,
} from './Server.constant';
import authConfig from '../../config/auth.config';
import cors from "cors";

const ConnectMongo = require('connect-mongo');

class ServerRunner extends RestEntitiy {
  private sessionConfig = {
    secret: authConfig.SECRET,
    saveUninitialized: true,
    resave: true,
    store: ConnectMongo.create({
      mongoUrl: process.env.MONGODB_URI as string,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: 'native',
    }),
  };

  private smtpConfig = {
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    logger: true,
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
    this.getApp().use(passport.initialize());
    this.getApp().use(passport.session());
    this.getApp().use(handleError);
    this.getApp().use(cors({
      origin: 'http://localhost:3000',
      optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
    }))

    const dropbox = new DropboxManager();
    const mailer: Readonly<Mail> = new Mailer(this.smtp, {
      from: process.env.TOKEN_YANDEX_USER,
    });

    const isMailerClientCreated = await mailer.create();

    if (!isMailerClientCreated) {
      throw new Error('Invalid create transport mailer');
    }

    this.getApp().locals.dropbox = dropbox;
    this.getApp().locals.mailer = mailer;
    useJWT(instanse.dbm);

    const instanceRouter: Route = Router.instance(this.getApp());

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
    this.setRest(instanceRouter.initInstance(API_ROUTE));
    this.getRest().use(useTimer);
    this.getRest().use(useAuth);
    this.getRest().use(useLimitRate());
    this.getRest().use(DEMO_ROUTE_CREATE_TICKET, regTicketLimitter);

    instanse.ws.startSocketConnection(new socketio.Server(server));
    new Chat(instanse.ws).run();

    console.log(CONTROLLERS_REGISTER)
    initControllers(
      Object.values(CONTROLLERS_MAP).map((controllerKey) => CONTROLLERS_REGISTER[controllerKey]),
      this.getApp.bind(this),
      this.getRest.bind(this),
      instanse.ws,
    );
    ProcessRouter.errorEventsRegister(server, instanse.dbm);
  }
}

export default ServerRunner;
