import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

import { Dbms } from '../../Utils/Interfaces/Interfaces.global';

dotenv.config();
export class ManagmentDatabase implements Dbms {
  private readonly dbClient: string;

  private readonly connectionString: string;

  public status: any = null;

  constructor(db: string, connectionString: string) {
    mongoose.set('debug', false);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
    this.dbClient = db;
    this.connectionString = connectionString;
    console.log('connectionString:', connectionString);
    mongoose.connect(
      connectionString,
      {
        useCreateIndex: true,
        keepAlive: true,
      },
      (err) => {
        if (err) console.error(err);
      },
    );
  }

  get db() {
    return this.dbClient;
  }

  public async connection(): Promise<Connection | typeof mongoose> {
    return mongoose.connection;
  }

  public getStatus(): number {
    return mongoose.connection.readyState;
  }

  public getConnectionString(): string {
    return this.connectionString;
  }

  public disconnect(): Promise<void> {
    return mongoose.disconnect();
  }
}
