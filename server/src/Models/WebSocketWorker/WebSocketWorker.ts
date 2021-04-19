import socketio from 'socket.io';
import { WsWorker } from '../../Utils/Interfaces/Interfaces.global';
import cluster from 'cluster';

// TODO: https://blog.imaginea.com/7597-2/
class WebSocketWorker implements WsWorker {
  private workers: Array<socketio.Server> = [];

  public startSocketConnection(io: socketio.Server): void {
    this.workers[this.getWorkerId()] = io;
  }

  public getWorkerId(): number {
    return cluster.worker.id;
  }

  public getWorker(id: number = cluster.worker.id): socketio.Server {
    return this.workers[id];
  }

  public getWorkersArray(): Array<socketio.Server> {
    return this.workers;
  }
}

export default WebSocketWorker;
