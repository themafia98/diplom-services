import { Server as WorkerIO, Socket } from 'socket.io';
import _ from 'lodash';
import cluster from 'cluster';
import { ChatModel } from '../../utils/Interfaces/Interfaces.global';
import WebSocketWorker from '../WebSocketWorker';
import { initFakeRoomEvent, newMessageEvent, processMessageEvent, workerDisconnect } from './Chat.events';

class Chat implements ChatModel {
  private _ws: WebSocketWorker;
  private _worker: WorkerIO;

  constructor(ws: WebSocketWorker) {
    this._ws = ws;
    this._worker = ws.getWorker(cluster.worker.id);
  }

  get ws() {
    return this._ws;
  }

  get worker() {
    return this._worker;
  }

  private registerEventsListeners(socket: Socket): void {
    socket.emit('connection', true);

    socket.on('newMessage', newMessageEvent(socket));
    socket.on('initFakeRoom', initFakeRoomEvent(socket));
    socket.on('onChatRoomActive', initFakeRoomEvent(socket));
    this.worker.on('disconnect', workerDisconnect);
    process.on('message', processMessageEvent(this.ws));
  }

  public run(): void {
    if (!this.worker) {
      throw new Error('Worker in Chat not found');
    }

    this.worker.on('connection', this.registerEventsListeners);
  }

  public destroy(socket: Socket): void {
    socket.off('newMessage', newMessageEvent(socket));
    socket.off('initFakeRoom', initFakeRoomEvent(socket));
    socket.off('onChatRoomActive', initFakeRoomEvent(socket));
    this.worker.off('disconnect', workerDisconnect);
    process.off('message', processMessageEvent(this.ws));
  }
}

export default Chat;
