import WebSocketWorker from '../Models/WebSocketWorker';
import { ManagmentDatabase } from '../Models/Database/Database';

export default {
  ws: new WebSocketWorker(),
  dbm: new ManagmentDatabase('controllSystem', process.env.MONGODB_URI as string),
};
