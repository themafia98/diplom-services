import WebSocketWorker from '../models/WebSocketWorker';
import Database from '../models/Database';
import { Dbms } from './Interfaces/Interfaces.global';

namespace Instanse {
  export const ws: WebSocketWorker = new WebSocketWorker();
  export const dbm: Dbms = new Database.ManagmentDatabase(
    'controllSystem',
    process.env.MONGODB_URI as string,
  );
}

export default Instanse;
