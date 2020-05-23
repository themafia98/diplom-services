declare module 'connect-mongo';
declare module 'express-rate-limit';
declare module 'uuid';
declare module 'jsonwebtoken';
declare namespace NodeJS {
  export interface ProcessEnv {
    HOST: string;
    DB_URL: string;
    DB_NAME?: string;
  }
}
