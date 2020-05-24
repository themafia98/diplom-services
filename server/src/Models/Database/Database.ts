import mongoose, { Connection } from 'mongoose';
import dotenv from 'dotenv';

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

    get db() {
      return this.dbClient;
    }

    public getStatus(): number {
      return mongoose.connection.readyState;
    }

    public getConnectionString(): string {
      return this.connectionString;
    }

    public async connection(): Promise<Connection | typeof mongoose> {
      try {
        return mongoose.connection;
      } catch (err) {
        return this.connect;
      }
    }

    /** @deprecated */
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
