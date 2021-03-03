import WebSocketWorker from '../Models/WebSocketWorker';
import Database from '../Models/Database';
import { Dbms } from './Interfaces/Interfaces.global';

namespace Instanse {
  export const ws: WebSocketWorker = new WebSocketWorker();
  export const dbm: Dbms = new Database.ManagmentDatabase(
    'controllSystem',
    process.env.MONGODB_URI as string,
  );
}

export default Instanse;
