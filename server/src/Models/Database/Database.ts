import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';
import _ from 'lodash';

import { Dbms } from '../../Utils/Interfaces';

namespace Database {
  dotenv.config();
  export class ManagmentDatabase implements Dbms {
    private readonly dbClient: string;
    private readonly connectionString: string;
    private readonly connect: Promise<typeof mongoose>;

    public status: any = null;

    constructor(db: string, connectionString: string) {
      mongoose.set('debug', false);
      mongoose.set('useFindAndModify', false);
      mongoose.set('useCreateIndex', true);
      this.dbClient = db;
      this.connectionString = connectionString;

      this.connect = mongoose.connect(
        connectionString,
        {
          useNewUrlParser: true,
          useCreateIndex: true,
          useUnifiedTopology: true,
          keepAlive: true,
        },
        (err) => {
          if (err) console.error(err);
        },
      );
    }

    public get db() {
      return this.dbClient;
    }

    public getConnectionString(): string {
      return this.connectionString;
    }

    public async connection(): Promise<Connection | typeof mongoose> {
      try {
        const status = mongoose.connection.readyState;
        console.log('status mongoose connect:', status);

        return mongoose.connection;
      } catch (err) {
        return this.connect;
      }
    }

    public async disconnect(): Promise<typeof mongoose | null> {
      try {
        // await mongoose.disconnect();
        return this.getConnect();
      } catch (err) {
        console.error('Disconnect error:', err);
        return null;
      }
    }

    public getConnect(): Promise<typeof mongoose> {
      return this.connect;
    }
  }
}

export default Database;
